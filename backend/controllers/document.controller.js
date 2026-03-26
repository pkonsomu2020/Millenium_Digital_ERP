import { supabase } from '../config/supabase.js';

// Get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { original_name, file_type, file_size, category, uploaded_by, notes } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Save document metadata to database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        file_name: fileName,
        original_name: original_name || file.originalname,
        file_type: file_type || file.mimetype,
        file_size: file_size || file.size,
        category,
        uploaded_by,
        file_url: publicUrl,
        notes: notes || ''
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document info
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('file_name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.file_name]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all meeting minutes
export const getAllMinutes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('meeting_minutes')
      .select('*')
      .order('meeting_date', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching meeting minutes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload meeting minutes
export const uploadMinutes = async (req, res) => {
  try {
    const { meeting_date, meeting_title, uploaded_by, notes } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload file to Supabase Storage
    const fileName = `minutes-${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meeting-minutes')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('meeting-minutes')
      .getPublicUrl(fileName);

    // Save minutes metadata to database
    const { data, error } = await supabase
      .from('meeting_minutes')
      .insert({
        file_name: fileName,
        original_name: file.originalname,
        file_type: file.mimetype,
        file_size: file.size,
        meeting_date,
        meeting_title,
        uploaded_by,
        file_url: publicUrl,
        notes: notes || ''
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error uploading minutes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete meeting minutes
export const deleteMinutes = async (req, res) => {
  try {
    const { id } = req.params;

    // Get minutes info
    const { data: minutes, error: fetchError } = await supabase
      .from('meeting_minutes')
      .select('file_name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('meeting-minutes')
      .remove([minutes.file_name]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: deleteError } = await supabase
      .from('meeting_minutes')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Meeting minutes deleted successfully' });
  } catch (error) {
    console.error('Error deleting minutes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update meeting minutes metadata (no file replacement)
export const updateMinutes = async (req, res) => {
  try {
    const { id } = req.params;
    const { meeting_date, meeting_title, uploaded_by, notes } = req.body;

    const { data, error } = await supabase
      .from('meeting_minutes')
      .update({ meeting_date, meeting_title, uploaded_by, notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating minutes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update document metadata (no file replacement)
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { original_name, category, uploaded_by, notes } = req.body;

    const { data, error } = await supabase
      .from('documents')
      .update({ original_name, category, uploaded_by, notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: error.message });
  }
};
