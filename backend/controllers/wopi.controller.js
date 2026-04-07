/**
 * WOPI Host Implementation
 * Enables Microsoft Office Online (Word, Excel, PowerPoint) to open and
 * auto-save documents stored in Supabase Storage — exactly like Dropbox.
 *
 * Protocol: https://learn.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/rest/
 *
 * Flow:
 *   1. Frontend opens: https://office.live.com/op/edit.aspx?WOPISrc=<backend>/wopi/files/:id&access_token=<token>
 *   2. Office Online calls GET /wopi/files/:id          → CheckFileInfo
 *   3. Office Online calls GET /wopi/files/:id/contents → file bytes from Supabase
 *   4. On save, Office Online calls POST /wopi/files/:id/contents → we write back to Supabase
 */

import { supabase } from '../config/supabase.js';

// Map file extensions to Office Online app action URLs
const OFFICE_APPS = {
  // Word
  docx: { edit: 'https://word.office.live.com/op/edit.aspx', view: 'https://word.office.live.com/op/view.aspx' },
  doc:  { edit: 'https://word.office.live.com/op/edit.aspx', view: 'https://word.office.live.com/op/view.aspx' },
  // Excel
  xlsx: { edit: 'https://excel.office.live.com/op/edit.aspx', view: 'https://excel.office.live.com/op/view.aspx' },
  xls:  { edit: 'https://excel.office.live.com/op/edit.aspx', view: 'https://excel.office.live.com/op/view.aspx' },
  // PowerPoint
  pptx: { edit: 'https://powerpoint.office.live.com/op/edit.aspx', view: 'https://powerpoint.office.live.com/op/view.aspx' },
  ppt:  { edit: 'https://powerpoint.office.live.com/op/edit.aspx', view: 'https://powerpoint.office.live.com/op/view.aspx' },
};

export const getExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase() || '';
};

export const isOfficeFile = (filename) => {
  return !!OFFICE_APPS[getExtension(filename)];
};

export const getOfficeEditUrl = (fileId, backendUrl, accessToken) => {
  return `${backendUrl}/wopi/files/${fileId}?access_token=${accessToken}`;
};

// ─── CheckFileInfo ────────────────────────────────────────────────────────────
// Office Online calls this first to get file metadata
export const checkFileInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const table = req.query.table || 'documents'; // 'documents' or 'minutes'

    const { data: doc, error } = await supabase
      .from(table === 'minutes' ? 'meeting_minutes' : 'documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !doc) return res.status(404).json({ error: 'File not found' });

    const ext = getExtension(doc.original_name || doc.file_name);
    const sizeBytes = doc.file_size || 0;

    // Required WOPI CheckFileInfo response
    res.json({
      BaseFileName: doc.original_name || doc.file_name,
      OwnerId: doc.uploaded_by || 'admin',
      Size: sizeBytes,
      UserId: 'millenium-user',
      UserFriendlyName: doc.uploaded_by || 'Admin',
      UserCanWrite: true,
      UserCanRename: false,
      ReadOnly: false,
      RestrictedWebViewOnly: false,
      SupportsUpdate: true,
      SupportsLocks: false,
      SupportsGetLock: false,
      SupportsExtendedLockLength: false,
      SupportsFolders: false,
      SupportsUserInfo: false,
      IsAnonymousUser: false,
      Version: String(doc.updated_at || doc.upload_date || Date.now()),
      LastModifiedTime: doc.updated_at || doc.upload_date || new Date().toISOString(),
    });
  } catch (err) {
    console.error('WOPI CheckFileInfo error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GetFile ──────────────────────────────────────────────────────────────────
// Office Online calls this to download the file bytes
export const getFileContents = async (req, res) => {
  try {
    const { id } = req.params;
    const table = req.query.table || 'documents';

    const { data: doc, error } = await supabase
      .from(table === 'minutes' ? 'meeting_minutes' : 'documents')
      .select('file_name, original_name, file_type, file_url')
      .eq('id', id)
      .single();

    if (error || !doc) return res.status(404).json({ error: 'File not found' });

    // Download file bytes from Supabase Storage
    const bucket = table === 'minutes' ? 'meeting-minutes' : 'documents';
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(doc.file_name);

    if (downloadError) throw downloadError;

    const buffer = Buffer.from(await fileData.arrayBuffer());

    res.setHeader('Content-Type', doc.file_type || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.original_name || doc.file_name}"`);
    res.send(buffer);
  } catch (err) {
    console.error('WOPI GetFile error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PutFile ──────────────────────────────────────────────────────────────────
// Office Online calls this to save the updated file bytes back
export const putFileContents = async (req, res) => {
  try {
    const { id } = req.params;
    const table = req.query.table || 'documents';
    const isMinutes = table === 'minutes';
    const dbTable = isMinutes ? 'meeting_minutes' : 'documents';
    const bucket = isMinutes ? 'meeting-minutes' : 'documents';

    // Get existing record
    const { data: doc, error: fetchError } = await supabase
      .from(dbTable)
      .select('file_name, original_name, file_type')
      .eq('id', id)
      .single();

    if (fetchError || !doc) return res.status(404).json({ error: 'File not found' });

    // Read raw body bytes (Office Online sends raw binary)
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);

        if (buffer.length === 0) {
          // Office Online sends empty body on lock/unlock — just return OK
          return res.status(200).json({});
        }

        // Overwrite the file in Supabase Storage (upsert)
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(doc.file_name, buffer, {
            contentType: doc.file_type || 'application/octet-stream',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Update file size and timestamp in DB
        await supabase
          .from(dbTable)
          .update({ file_size: buffer.length, updated_at: new Date().toISOString() })
          .eq('id', id);

        console.log(`[WOPI] Saved ${doc.original_name} (${buffer.length} bytes)`);
        res.status(200).json({});
      } catch (err) {
        console.error('WOPI PutFile save error:', err);
        res.status(500).json({ error: err.message });
      }
    });
  } catch (err) {
    console.error('WOPI PutFile error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Text/CSV inline content endpoints ───────────────────────────────────────
// For .txt and .csv files — fetch raw text content
export const getTextContent = async (req, res) => {
  try {
    const { id } = req.params;
    const table = req.query.table || 'documents';
    const isMinutes = table === 'minutes';

    const { data: doc, error } = await supabase
      .from(isMinutes ? 'meeting_minutes' : 'documents')
      .select('file_name, file_type')
      .eq('id', id)
      .single();

    if (error || !doc) return res.status(404).json({ error: 'File not found' });

    const bucket = isMinutes ? 'meeting-minutes' : 'documents';
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(doc.file_name);

    if (downloadError) throw downloadError;

    const text = await fileData.text();
    res.json({ content: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save updated text/csv content back to Supabase Storage
export const saveTextContent = async (req, res) => {
  try {
    const { id } = req.params;
    const table = req.query.table || 'documents';
    const isMinutes = table === 'minutes';
    const dbTable = isMinutes ? 'meeting_minutes' : 'documents';
    const bucket = isMinutes ? 'meeting-minutes' : 'documents';
    const { content } = req.body;

    if (content === undefined) return res.status(400).json({ error: 'No content provided' });

    const { data: doc, error: fetchError } = await supabase
      .from(dbTable)
      .select('file_name, file_type')
      .eq('id', id)
      .single();

    if (fetchError || !doc) return res.status(404).json({ error: 'File not found' });

    const buffer = Buffer.from(content, 'utf-8');

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(doc.file_name, buffer, {
        contentType: doc.file_type || 'text/plain',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    await supabase
      .from(dbTable)
      .update({ file_size: buffer.length, updated_at: new Date().toISOString() })
      .eq('id', id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
