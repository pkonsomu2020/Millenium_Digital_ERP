import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { api } from "../../../services/api";
import { toast } from "sonner";

interface LeaveRequest {
  id: string;
  employee_name: string;
  employee_email: string;
  manager: string | null;
  contact_while_on_leave: string | null;
  leave_type: string;
  custom_leave_type: string | null;
  start_date: string;
  end_date: string;
  days_applied: number;
  days_accrued: number | null;
  leave_balance: number | null;
  balance_bf: number | null;
  reason: string;
  handover_reviewed: boolean;
  handover_notes: string | null;
  submitted_by: string;
  submitted_on: string;
  employee_signature: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_on: string | null;
  hr_signature: string | null;
  hr_remarks: string | null;
  deferred_date: string | null;
}

export function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"Approved" | "Rejected" | "Deferred">("Approved");
  const [reviewData, setReviewData] = useState({ hr_remarks: "", hr_signature: "", deferred_date: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
    const interval = setInterval(() => fetchLeaveRequests(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaveRequests = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.getAllLeaveRequests();
      setLeaveRequests(data);
    } catch { if (!silent) toast.error("Failed to load leave requests"); }
    finally { if (!silent) setLoading(false); }
  };

  const handleReviewSubmit = async () => {
    if (!selectedRequest) return;
    if (reviewAction === "Rejected" && !reviewData.hr_remarks.trim()) {
      toast.error("Please provide remarks for rejection"); return;
    }
    if (reviewAction === "Deferred" && !reviewData.deferred_date) {
      toast.error("Please provide the deferred date"); return;
    }
    try {
      setSubmitting(true);
      await api.updateLeaveStatus(selectedRequest.id, {
        status: reviewAction,
        reviewed_by: "HR Manager",
        hr_remarks: reviewData.hr_remarks || null,
        hr_signature: reviewData.hr_signature || null,
        deferred_date: reviewData.deferred_date || null,
      });
      toast.success(`Leave request ${reviewAction.toLowerCase()} successfully`);
      setReviewDialogOpen(false);
      fetchLeaveRequests();
    } catch { toast.error("Failed to update leave request"); }
    finally { setSubmitting(false); }
  };

  const getDisplayType = (r: LeaveRequest) =>
    r.leave_type === "Others" && r.custom_leave_type ? r.custom_leave_type : r.leave_type;

  const getStatusBadge = (s: string) => {
    const map: Record<string, string> = {
      Pending: "bg-yellow-500", Approved: "bg-green-500",
      Rejected: "bg-red-500", Deferred: "bg-blue-500"
    };
    return <Badge className={`${map[s] || "bg-gray-500"} hover:opacity-90 text-xs`}>{s}</Badge>;
  };

  const filtered = leaveRequests.filter(r =>
    r.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.leave_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const counts = {
    pending: leaveRequests.filter(r => r.status === "Pending").length,
    approved: leaveRequests.filter(r => r.status === "Approved").length,
    rejected: leaveRequests.filter(r => r.status === "Rejected").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><div className="flex items-center gap-2"><Clock className="w-5 h-5 text-yellow-500" /><CardTitle className="text-yellow-600 dark:text-yellow-400">Pending</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pending}</p></CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /><CardTitle className="text-green-600 dark:text-green-400">Approved</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.approved}</p></CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><div className="flex items-center gap-2"><XCircle className="w-5 h-5 text-[#D1131B]" /><CardTitle className="text-[#D1131B]">Rejected</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-[#D1131B]">{counts.rejected}</p></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by employee name or leave type..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      {/* Table */}
      <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
          <CardTitle className="text-[#374151] dark:text-white">Leave Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> :
            filtered.length === 0 ? <div className="p-8 text-center text-gray-500">No leave requests found</div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                    <TableHead className="whitespace-nowrap text-sm">Employee</TableHead>
                    <TableHead className="whitespace-nowrap text-sm hidden sm:table-cell">Leave Type</TableHead>
                    <TableHead className="whitespace-nowrap text-sm hidden md:table-cell">Start Date</TableHead>
                    <TableHead className="whitespace-nowrap text-sm hidden md:table-cell">End Date</TableHead>
                    <TableHead className="text-center whitespace-nowrap text-sm hidden lg:table-cell">Days</TableHead>
                    <TableHead className="text-center whitespace-nowrap text-sm">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{r.employee_name}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">{getDisplayType(r)}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{new Date(r.start_date).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{new Date(r.end_date).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm hidden lg:table-cell">{r.days_applied}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(r.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400" onClick={() => { setSelectedRequest(r); setViewDialogOpen(true); }}><Eye className="w-4 h-4" /></Button>
                          {r.status === "Pending" && (<>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs h-8 px-2" onClick={() => { setSelectedRequest(r); setReviewAction("Approved"); setReviewData({ hr_remarks: "", hr_signature: "", deferred_date: "" }); setReviewDialogOpen(true); }}><CheckCircle className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Approve</span></Button>
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-8 px-2" onClick={() => { setSelectedRequest(r); setReviewAction("Deferred"); setReviewData({ hr_remarks: "", hr_signature: "", deferred_date: "" }); setReviewDialogOpen(true); }}><span className="hidden sm:inline">Defer</span><span className="sm:hidden">D</span></Button>
                            <Button size="sm" className="bg-[#D1131B] hover:bg-[#B01018] text-white text-xs h-8 px-2" onClick={() => { setSelectedRequest(r); setReviewAction("Rejected"); setReviewData({ hr_remarks: "", hr_signature: "", deferred_date: "" }); setReviewDialogOpen(true); }}><XCircle className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Reject</span></Button>
                          </>)}
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="dark:text-white">Leave Application Details</DialogTitle></DialogHeader>
          {selectedRequest && (
            <div className="grid gap-3 py-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Employee Name</p><p className="font-medium dark:text-white">{selectedRequest.employee_name}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Email</p><p className="font-medium dark:text-white">{selectedRequest.employee_email}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Manager</p><p className="font-medium dark:text-white">{selectedRequest.manager || "—"}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Contact While on Leave</p><p className="font-medium dark:text-white">{selectedRequest.contact_while_on_leave || "—"}</p></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Leave Type</p><p className="font-medium dark:text-white">{getDisplayType(selectedRequest)}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Days Applied</p><p className="font-medium dark:text-white">{selectedRequest.days_applied}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Start Date</p><p className="font-medium dark:text-white">{new Date(selectedRequest.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">End Date</p><p className="font-medium dark:text-white">{new Date(selectedRequest.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Days Accrued</p><p className="font-medium dark:text-white">{selectedRequest.days_accrued ?? "—"}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Leave Balance</p><p className="font-medium dark:text-white">{selectedRequest.leave_balance ?? "—"}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Balance B/F</p><p className="font-medium dark:text-white">{selectedRequest.balance_bf ?? "—"}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Status</p><div className="mt-1">{getStatusBadge(selectedRequest.status)}</div></div>
              </div>
              <Separator />
              <div><p className="text-gray-500 dark:text-gray-400 text-xs">Status</p><div className="mt-1">{getStatusBadge(selectedRequest.status)}</div></div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Employee Signature</p><p className="font-medium dark:text-white">{selectedRequest.employee_signature || "—"}</p></div>
              </div>
              {selectedRequest.reviewed_by && (<>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-gray-500 dark:text-gray-400 text-xs">Reviewed By</p><p className="font-medium dark:text-white">{selectedRequest.reviewed_by}</p></div>
                  <div><p className="text-gray-500 dark:text-gray-400 text-xs">HR Signature</p><p className="font-medium dark:text-white">{selectedRequest.hr_signature || "—"}</p></div>
                  {selectedRequest.deferred_date && <div><p className="text-gray-500 dark:text-gray-400 text-xs">Deferred To</p><p className="font-medium dark:text-white">{new Date(selectedRequest.deferred_date).toLocaleDateString("en-GB")}</p></div>}
                </div>
                {selectedRequest.hr_remarks && <div><p className="text-gray-500 dark:text-gray-400 text-xs">HR Remarks</p><p className="font-medium dark:text-white">{selectedRequest.hr_remarks}</p></div>}
              </>)}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[480px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {reviewAction === "Approved" ? "Approve" : reviewAction === "Deferred" ? "Defer" : "Reject"} Leave — {selectedRequest?.employee_name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {reviewAction === "Deferred" && (
              <div className="grid gap-2"><Label>Deferred Date *</Label><Input type="date" value={reviewData.deferred_date} onChange={e => setReviewData(p => ({ ...p, deferred_date: e.target.value }))} className="dark:bg-gray-700 dark:border-gray-600" /></div>
            )}
            <div className="grid gap-2">
              <Label>HR Remarks {reviewAction === "Rejected" ? "*" : "(Optional)"}</Label>
              <Textarea value={reviewData.hr_remarks} onChange={e => setReviewData(p => ({ ...p, hr_remarks: e.target.value }))} placeholder={reviewAction === "Rejected" ? "Reason for rejection..." : reviewAction === "Deferred" ? "Reason for deferral..." : "Any notes..."} className="dark:bg-gray-700 dark:border-gray-600" rows={3} />
            </div>
            <div className="grid gap-2"><Label>HR Signature</Label><Input value={reviewData.hr_signature} onChange={e => setReviewData(p => ({ ...p, hr_signature: e.target.value }))} placeholder="Type full name as signature" className="dark:bg-gray-700 dark:border-gray-600" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button className={reviewAction === "Approved" ? "bg-green-500 hover:bg-green-600" : reviewAction === "Deferred" ? "bg-blue-500 hover:bg-blue-600" : "bg-[#D1131B] hover:bg-[#B01018]"} onClick={handleReviewSubmit} disabled={submitting}>
              {submitting ? "Processing..." : reviewAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
