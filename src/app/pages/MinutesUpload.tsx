import { useState, useEffect } from "react";
import { Upload, Search, FileText, Download, Eye, Trash2, Calendar, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {omponents/ui/dialog";
import { api } from "../../services/api";
import { toast } from "sonner";

interface MeetingMinutes {
  id: string;
  original_name: string;
  file_type: string;
  file_size: number;
  meeting_date: string;
  meeting_title: string;
  uploaded_by: string;
  upload_date: string;
  file_url: string;
  notes: string;
}

export function MinutesUpload() {
  const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, seQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ meeting_date: "", meeting_title: "", uploaded_by: "", notes: "" });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMinute, setEditingMinute] = useState<MeetingMinutes | null>(null);
  const [editFor({ meeting_date: "", meeting_title: "", uploaded_by: "", notes: "" });
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMinutes(); }, []);

  const fetchMinutes = async () => {
    try {
      setLoading(true);
      const data = await api.getAllMinutes();
      setMinutes(data);
    } catch { toast.error("Failed to load meeting minutes"); }
    finally { setLoading(false); }
  };

  conngeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.meeting_date || !formData.meeting_title || !formData.uploaded_by) {
      toast.error("Please fill in all required fields"); return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("meeting_date", formData.meeting_date);
      fd.append("meeting_title", formData.meeting_title);
      fd.append("uploaded_by", formData.uploaded_by);
      fd.append("notes", formData.notes);
      await api.uploadMinutes(fd);
      toast.success("Meeting minutes uploaded successfully");
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setFormData({ meeting_date: "", meeting_title: "", uploaded_by: "", notes: "" });
      fetchMinutes();
    } catch { toast.error("Failed to upload meeting minutes"); }
    finally { setUploading(false); }
  };

  const openEditDialog = (minute: MeetingMinutes) => {
    setEditingMinute(minute);
    setEditForm({ meeting_date: minute.meeting_date.split("T")[0], meeting_title: minute.meeting_title, uploaded_by: minute.uploaded_by, notes: minute.notes || "" });
    setReplaceFile(null);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMinute) return;
    if (!editForm.meeting_date || !editForm.meeting_title || !editForm.uploaded_by) {

    }
    try {
      setSaving(true);
      if (replaceFile) {
        const fd = new FormData();
        fd.append("file", replaceFile);
        await api.replaceMinutes(editingMinute.id, fd);
      }
      await api.updateMinutes(editingMinute.id, editForm);
      toast.success("Minutes updated successfully");
      setEditDialogOpen(false);
      setReplaceFile(null);
      fetchMinutes();
    } catch { toast.error("Failed to update minutes"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete minutes for "${title}"?`)) return;
    try {
      await api.deleteMinutes(id);
      toast.success("Meeting minutes deleted successfully");
      fetchMinutes();
    } catch { toast.error("Failed to delete meeting minutes"); }
  };

  const handleView = (url: string) => window.open(url, "_blank");

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl; link.download = filename;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download started");
    } catch { toast.error("Failed to download file"); }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024; const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const filteredMinutes = minutes.filter(m =>
    m.meeting_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedMinutes = filteredMinutes.reduce((acc, minute) => {
    const date = new Date(minute.meeting_date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[yearMonth]) acc[yearMonth] = [];
    acc[yearMonth].push(minute);
    return acc;
  }, {} as Record<string, MeetingMinutes[]>);

  const sortedYearMonths = Object.keys(groupedMinutes).sort().reverse();

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      <div className="mb-6">
        <h1 className="text-2xl smray-900 dark:text-white mb-2">Meeting Minutes</h1>
        <p className="text-gray-600 dark:text-gray-400">Upload and manage meeting minutes for Millenium Solutions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow{minutes.length}</p></CardContent></Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700"><CardContent className="p-4 text-center"><p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Year</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{minutes.filter(m => new Date(m.meeting_date).getFullYear() === new Date().getFullYear()).length}</p></CardContent></Card>
        <Card classNap-4 text-center"><p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{minutes.filter(m => { const d = new Date(m.meeting_date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length}</p></CardContent></Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 relative">
    rch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <Input placeholder="Search meeting minutes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 sm:pl-10 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white text-sm sm:text-base whitespace-nowrap" onClick={() => setUploadDialogOpen(true)}>
          <Upload claName="w-4 h-4 mr-2" />Upload Minutes
        </Button>
      </div>

      {/* Minutes by Month */}
      {loading ? (
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700"><CardContent className="p-8 text-center text-gray-500">Loading meeting minutes...</CardContent></Card>
      ) : filteredMinutes.length === 0 ? (
        <Card className="shadow-md 
      ) : (
        <div className="space-y-6">
          {sortedYearMonths.map((yearMonth) => {
            const [year, month] = yearMonth.split('-');
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            return (
              <Card key={yearMonth} className="shadow-md dark:bg-gray-800 dark:border-gray-700">
         
                  <CardTitle className="text-lg sm:text-xl text-[#374151] dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />{monthName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-700/50">
         ead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm">Meeting Title</TableHead>
                          <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm">Meeting Date</TableHead>
                          <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm hidden md:table-cell">File Name</TableHead>
                          <Tabltext-gray-200 whitespace-nowrap text-sm hidden lg:table-cell">Uploaded By</TableHead>
                          <TableHead className="font-semibold text-[#374151] dark:text-gray-200 text-right whitespace-nowrap text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedMinutes[yearMonth].map((minute) => (
                          <TableRow key={minute.id} classN transition-colors">
                            <TableCell className="text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[#D1131B] flex-shrink-0" />
                                <span className="text-gray-900 dark:text-white font-medium">{minute.meeting_title}</span>
                              </div>
                            </TableCell>
assName="text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap">
                              {new Date(minute.meeting_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm hidden md:table-cell">
                              <span className="truncate max-w-[200px] block">{minute.original_name}</span>
                              <span className="text-xs text-gray-500">{formatFileSize(minute.file_size)}</span>
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">{minute.uploaded_by}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 sm:gap-2 justify-end">
className="text-blue-600 dark:text-blue-400 hover:text-blue-700 h-8 w-8 p-0" onClick={() => handleView(minute.file_url)} title="View"><Eye className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                                <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 hover:text-green-700 h-8 w-8 p-0" onClick={() => handleDownload(minute.file_url, minute.original_name)} title="Download"><Download className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                               variant="ghost" size="sm" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 h-8 w-8 p-0" onClick={() => openEditDialog(minute)} title="Edit"><Pencil className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
                                <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400 hover:text-red-700 h-8 w-8 p-0" onClick={() => handleDelete(minute.id, minute.meeting_title)} title="Delete"><Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
 </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
     gTitle className="text-xl font-semibold text-gray-900 dark:text-white">Upload Meeting Minutes</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Select File *</Label>
              <Input id="file" type="file" onChange={handleFileSelect} accept=".pdf,.doc,.docx" className="dark:bg-gray-700 dark:border-gray-600" />
              {selectedFile.name} ({formatFileSize(selectedFile.size)})</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting_title">Meeting Title *</Label>
              <Input id="meeting_title" value={formData.meeting_title} onChange={(e) => setFormData({ ...formData, meeting_title: e.target.value })} placeholder="e.g., Q1 2026 Board Meeting" className="dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting_date">Meeting Date *</Label>
              <Input id="meeting_date" type="date" value={formData.meeting_date} onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })} className="dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="uploaded_by">Uploaded By *</Label>
ue })} placeholder="Enter your name" className="dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add any notes about this meeting" className="dark:bg-gray-700 dark:border-gray-600" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>Cancel</Button>
            <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white" onClick={handleUpload} disabled={uploading || !selectedFile}>{uploading ? "Uploading..." : "Upload"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(v) => { setEditDialogOpen(v); if (!v) setReplaceFile(null); }}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
          <DialogHeader><DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Edit Meeting Minutes</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_title">Meeting Title *</Label>
              <Input id="edit_title" value={editForm.meeting_title}Name="dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_date">Meeting Date *</Label>
              <Input id="edit_date" type="date" value={editForm.meeting_date} onChange={(e) => setEditForm({ ...editForm, meeting_date: e.target.value })} className="dark:bg-gray-700 dark:border-gray-600" />
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
              <Input id="replace_file" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setReplaceFile(e.target.files?.[0] || null)} className="dark:bg-gray-700 dark:border-gray-600" />
              {replaceFile && <p className="text-xs text-green-600 dark:text-green-400">New file: {replaceFile.name} ({formatFileSize(replaceFile.size)})</p>}
              {!replaceFinute && <p className="text-xs text-gray-500 dark:text-gray-400">Current: {editingMinute.original_name} — leave blank to keep existing file</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setReplaceFile(null); }} disabled={saving}>Cancel</Button>
            <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white" onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
