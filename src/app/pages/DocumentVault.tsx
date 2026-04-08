import { useState, useEffect } from "react";
import { Upload, Search, FileText, Download, Eye, Trash2, X, Pencil, FileSpreadsheet, FileType, Presentation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { api } from "../../services/api";
import { toast } from "sonner";

interface Document {
  id: string;
  original_name: string;
  file_type: string;
  file_size: number;
  category: string;
  uploaded_by: string;
  upload_date: string;
  file_url: string;
  notes: string;
}

const CATEGORIES = ["Proposal", "Quotation", "Contract", "Report", "Invoice", "Other"];

export function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Documents");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    uploaded_by: "",
    notes: ""
  });

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editForm, setEditForm] = useState({ original_name: "", category: "", uploaded_by: "", notes: "" });
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Inline text/csv editor state
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [textEditorDoc, setTextEditorDoc] = useState<Document | null>(null);
  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [textSaving, setTextSaving] = useState(false);

  // File type helpers
  const getExt = (name: string) => name?.split('.').pop()?.toLowerCase() || '';
  const isOffice = (name: string) => ['docx','doc','xlsx','xls','pptx','ppt'].includes(getExt(name));
  const isText = (name: string) => ['txt','csv'].includes(getExt(name));
  const isPdfOrImage = (name: string) => ['pdf','jpg','jpeg','png','gif','webp','svg'].includes(getExt(name));
  const isEditable = (name: string) => isOffice(name) || isText(name);

  const getOfficeIcon = (name: string) => {
    const ext = getExt(name);
    if (['xlsx','xls'].includes(ext)) return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    if (['pptx','ppt'].includes(ext)) return <Presentation className="w-4 h-4 text-orange-500" />;
    if (['docx','doc'].includes(ext)) return <FileType className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
  };

  const getEditLabel = (name: string) => {
    const ext = getExt(name);
    if (['xlsx','xls'].includes(ext)) return 'Open in Sheets';
    if (['pptx','ppt'].includes(ext)) return 'Open in Slides';
    if (['docx','doc'].includes(ext)) return 'Open in Docs';
    if (['txt','csv'].includes(ext)) return 'Edit Inline';
    return 'Edit';
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getAllDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.category || !formData.uploaded_by) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("original_name", selectedFile.name);
      uploadFormData.append("file_type", selectedFile.type);
      uploadFormData.append("file_size", selectedFile.size.toString());
      uploadFormData.append("category", formData.category);
      uploadFormData.append("uploaded_by", formData.uploaded_by);
      uploadFormData.append("notes", formData.notes);

      await api.uploadDocument(uploadFormData);
      toast.success("Document uploaded successfully");
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setFormData({ category: "", uploaded_by: "", notes: "" });
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const openEditDialog = (doc: Document) => {
    setEditingDoc(doc);
    setEditForm({ original_name: doc.original_name, category: doc.category, uploaded_by: doc.uploaded_by, notes: doc.notes || "" });
    setReplaceFile(null);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDoc) return;
    if (!editForm.original_name || !editForm.category || !editForm.uploaded_by) {
      toast.error("Please fill in all required fields"); return;
    }
    try {
      setSaving(true);
      // If a replacement file was selected, replace the file first
      if (replaceFile) {
        const fd = new FormData();
        fd.append("file", replaceFile);
        await api.replaceDocument(editingDoc.id, fd);
      }
      // Always update metadata
      await api.updateDocument(editingDoc.id, editForm);
      toast.success("Document updated successfully");
      setEditDialogOpen(false);
      setReplaceFile(null);
      fetchDocuments();
    } catch {
      toast.error("Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenInOffice = (doc: Document) => {
    const ext = getExt(doc.original_name);
    // Use Google Docs/Sheets/Slides for editing - genuinely free, works with public URLs
    let editUrl = '';
    if (['xlsx','xls'].includes(ext)) {
      editUrl = `https://docs.google.com/spreadsheets/d/import?url=${encodeURIComponent(doc.file_url)}`;
    } else if (['pptx','ppt'].includes(ext)) {
      editUrl = `https://docs.google.com/presentation/d/import?url=${encodeURIComponent(doc.file_url)}`;
    } else {
      // Word docs - open in Google Docs
      editUrl = `https://docs.google.com/document/d/import?url=${encodeURIComponent(doc.file_url)}`;
    }
    window.open(editUrl, '_blank');
    toast.info("Edit in Google Docs, then download and use 'Replace File' to save back.", { duration: 6000 });
  };

  const openTextEditor = async (doc: Document) => {
    setTextEditorDoc(doc);
    setTextEditorOpen(true);
    setTextLoading(true);
    try {
      const content = await api.getTextContent(doc.id, 'documents');
      setTextContent(content);
    } catch { toast.error("Failed to load file content"); }
    finally { setTextLoading(false); }
  };

  const handleSaveText = async () => {
    if (!textEditorDoc) return;
    setTextSaving(true);
    try {
      await api.saveTextContent(textEditorDoc.id, textContent, 'documents');
      toast.success("File saved successfully");
      setTextEditorOpen(false);
      fetchDocuments();
    } catch { toast.error("Failed to save file"); }
    finally { setTextSaving(false); }
  };

  const handleEditDocument = (doc: Document) => {
    if (isText(doc.original_name)) {
      openTextEditor(doc);
    } else if (isOffice(doc.original_name)) {
      handleOpenInOffice(doc);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.deleteDocument(id);
      toast.success("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const categories = [
    { name: "All Documents", count: documents.length },
    ...CATEGORIES.map(cat => ({
      name: cat,
      count: documents.filter(d => d.category === cat).length
    }))
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All Documents" || doc.category === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Proposal": return "bg-green-500";
      case "Quotation": return "bg-yellow-500";
      case "Contract": return "bg-purple-500";
      case "Report": return "bg-blue-500";
      case "Invoice": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {categories.map((category) => (
          <Card
            key={category.name}
            className={`cursor-pointer shadow-md hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 ${
              selectedType === category.name ? "border-2 border-[#D1131B]" : ""
            }`}
            onClick={() => setSelectedType(category.name)}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{category.name}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{category.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <Button 
          className="bg-[#D1131B] hover:bg-[#B01018] text-white text-sm sm:text-base whitespace-nowrap"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Documents Table */}
      <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
          <CardTitle className="text-lg sm:text-xl text-[#374151] dark:text-white">
            {selectedType === "All Documents" ? "All Documents" : selectedType}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading documents...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No documents found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                    <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm">Document Name</TableHead>
                    <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm">Category</TableHead>
                    <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm hidden sm:table-cell">Upload Date</TableHead>
                    <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm hidden md:table-cell">Size</TableHead>
                    <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm hidden lg:table-cell">Uploaded By</TableHead>
                    <TableHead className="font-semibold text-[#374151] dark:text-gray-200 text-right whitespace-nowrap text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {getOfficeIcon(doc.original_name)}
                          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[150px] sm:max-w-none">{doc.original_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className={`${getTypeBadgeColor(doc.category)} hover:opacity-90 text-xs`}>
                          {doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                        {new Date(doc.upload_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                        {formatFileSize(doc.file_size)}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">{doc.uploaded_by}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 sm:gap-2 justify-end items-center">
                          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 h-8 w-8 p-0" onClick={() => handleView(doc.file_url)} title="View"><Eye className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 hover:text-green-700 h-8 w-8 p-0" onClick={() => handleDownload(doc.file_url, doc.original_name)} title="Download"><Download className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                          {isEditable(doc.original_name) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs font-medium text-white bg-[#D1131B] hover:bg-[#B01018] rounded-md flex items-center gap-1"
                              onClick={() => handleEditDocument(doc)}
                              title={getEditLabel(doc.original_name)}
                            >
                              <Pencil className="w-3 h-3" />
                              <span className="hidden sm:inline">{getEditLabel(doc.original_name)}</span>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 h-8 w-8 p-0" onClick={() => openEditDialog(doc)} title="Edit metadata"><Pencil className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400 hover:text-red-700 h-8 w-8 p-0" onClick={() => handleDelete(doc.id, doc.original_name)} title="Delete"><Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload Document
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* File Input */}
            <div className="grid gap-2">
              <Label htmlFor="file">Select File *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Uploaded By */}
            <div className="grid gap-2">
              <Label htmlFor="uploaded_by">Uploaded By *</Label>
              <Input
                id="uploaded_by"
                value={formData.uploaded_by}
                onChange={(e) => setFormData({ ...formData, uploaded_by: e.target.value })}
                placeholder="Enter your name"
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this document"
                className="dark:bg-gray-700 dark:border-gray-600"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#D1131B] hover:bg-[#B01018] text-white"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(v) => { setEditDialogOpen(v); if (!v) setReplaceFile(null); }}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Document
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_name">Document Name *</Label>
              <Input id="edit_name" value={editForm.original_name} onChange={(e) => setEditForm({ ...editForm, original_name: e.target.value })} className="dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_category">Category *</Label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_uploaded_by">Uploaded By *</Label>
              <Input id="edit_uploaded_by" value={editForm.uploaded_by} onChange={(e) => setEditForm({ ...editForm, uploaded_by: e.target.value })} className="dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea id="edit_notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="dark:bg-gray-700 dark:border-gray-600" rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="replace_file">Replace File (optional)</Label>
              <Input id="replace_file" type="file" onChange={(e) => setReplaceFile(e.target.files?.[0] || null)} className="dark:bg-gray-700 dark:border-gray-600" />
              {replaceFile && <p className="text-xs text-green-600 dark:text-green-400">New file: {replaceFile.name} ({formatFileSize(replaceFile.size)})</p>}
              {!replaceFile && editingDoc && <p className="text-xs text-gray-500 dark:text-gray-400">Current: {editingDoc.original_name} — leave blank to keep existing file</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setReplaceFile(null); }} disabled={saving}>Cancel</Button>
            <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white" onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Inline Text / CSV Editor Dialog */}
      <Dialog open={textEditorOpen} onOpenChange={(v) => { setTextEditorOpen(v); }}>
        <DialogContent className="sm:max-w-[800px] w-full dark:bg-gray-800 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="dark:text-white flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#D1131B]" />
              Editing: {textEditorDoc?.original_name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 py-2">
            {textLoading ? (
              <div className="flex items-center justify-center h-48 text-gray-500">Loading file content...</div>
            ) : (
              <textarea
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                className="w-full h-[50vh] p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#D1131B]"
                spellCheck={false}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTextEditorOpen(false)} disabled={textSaving}>Cancel</Button>
            <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white" onClick={handleSaveText} disabled={textSaving || textLoading}>
              {textSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
