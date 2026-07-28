import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { api } from "../../../services/api";
import { toast } from "sonner";

const ADMIN_EMPLOYEES = [
  { name: "Grace Wanjiru", email: "grace.wanjiru@millenium.co.ke", balance_bf: 0 },
  { name: "Mildred Aoko", email: "mildredondego61@gmail.com", balance_bf: 0 },
  { name: "Lilian Akinyi", email: "lilianakinyi852@gmail.com", balance_bf: 0 }
];

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
  stage1_status: string | null;
  stage1_reviewed_by: string | null;
  stage1_reviewed_on: string | null;
  stage1_remarks: string | null;
  stage1_signature: string | null;
  stage2_status: string | null;
  stage2_reviewed_by: string | null;
  stage2_reviewed_on: string | null;
  stage2_remarks: string | null;
  stage2_signature: string | null;
}

const ESTHER_EMAIL = "ekiilu@afosi.org";
const ROSE_EMAIL = "rosekirwa@millenium.co.ke";

export function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"Approved" | "Rejected" | "Deferred">("Approved");
  const [reviewStage, setReviewStage] = useState<1 | 2>(1);
  const [reviewData, setReviewData] = useState({ hr_remarks: "", deferred_date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(ADMIN_EMPLOYEES[0]);

  const currentUser = JSON.parse(sessionStorage.getItem("auth_user") || "{}");
  const isEsther = (currentUser.email || "").toLowerCase() === ESTHER_EMAIL;
  const isRose = (currentUser.email || "").toLowerCase() === ROSE_EMAIL;

  const canAct = (r: LeaveRequest) => {
    if (r.status !== "Pending") return false;
    if (isEsther) return !r.stage1_status || r.stage1_status === "Pending";
    if (isRose) return !!r.stage1_status && r.stage1_status !== "Pending" && (!r.stage2_status || r.stage2_status === "Pending");
    return false;
  };

  const openReview = (r: LeaveRequest, action: "Approved" | "Rejected" | "Deferred") => {
    setSelectedRequest(r);
    setReviewAction(action);
    setReviewStage(isEsther ? 1 : 2);
    setReviewData({ hr_remarks: "", deferred_date: "" });
    setReviewDialogOpen(true);
  };

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
        reviewer_email: currentUser.email,
        reviewer_name: currentUser.name,
        hr_remarks: reviewData.hr_remarks || null,
        deferred_date: reviewData.deferred_date || null,
      });
      toast.success(
        reviewStage === 1
          ? "Your review has been recorded — awaiting Rose's final approval"
          : `Leave request ${reviewAction.toLowerCase()} successfully`
      );
      setReviewDialogOpen(false);
      fetchLeaveRequests();
    } catch (err: any) { toast.error(err.message || "Failed to update leave request"); }
    finally { setSubmitting(false); }
  };

  const getDisplayType = (r: LeaveRequest) =>
    r.leave_type === "Others" && r.custom_leave_type ? r.custom_leave_type : r.leave_type;

  const getDisplayStatus = (r: LeaveRequest) => {
    if (r.status !== "Pending") return r.status;
    if (r.stage1_status && r.stage1_status !== "Pending") return "Awaiting Rose";
    return "Pending";
  };

  const getStatusBadge = (s: string) => {
    const map: Record<string, string> = {
      Pending: "bg-yellow-500", Approved: "bg-green-500",
      Rejected: "bg-red-500", Deferred: "bg-blue-500",
      "Awaiting Rose": "bg-indigo-500",
    };
    return <Badge className={`${map[s] || "bg-gray-500"} hover:opacity-90 text-xs`}>{s}</Badge>;
  };

  const filtered = leaveRequests
    .filter(r => r.employee_email === activeEmployee.email)
    .filter(r =>
      r.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.leave_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeEmployeeRequests = leaveRequests.filter(r => r.employee_email === activeEmployee.email);
  const counts = {
    pending: activeEmployeeRequests.filter(r => r.status === "Pending").length,
    approved: activeEmployeeRequests.filter(r => r.status === "Approved").length,
    rejected: activeEmployeeRequests.filter(r => r.status === "Rejected").length,
  };

  const currentYear = new Date().getFullYear();
  const liveAccrued = (new Date().getMonth() + 1) * 1.75;
  const startBfForCurrentYear = 0;

  const totalAnnualDaysTaken = activeEmployeeRequests
    .filter(r => (r.leave_type === "ANNUAL" || r.leave_type === "Annual Leave") && r.status !== "Rejected" && new Date(r.start_date).getFullYear() === currentYear)
    .reduce((sum, r) => sum + r.days_applied, 0);
  const annualBalance = 21 - totalAnnualDaysTaken;



  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      {/* Employee Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-white dark:bg-gray-850 p-2 rounded-xl border dark:border-gray-700 shadow-sm">
        {ADMIN_EMPLOYEES.map(emp => (
          <button
            key={emp.email}
            onClick={() => setActiveEmployee(emp)}
            className={`py-3 px-4 rounded-lg text-left transition-all duration-200 border ${
              activeEmployee.email === emp.email
                ? "bg-[#D1131B] text-white border-[#D1131B] shadow-md transform scale-[1.01]"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            }`}
          >
            <div className="font-bold text-sm">{emp.name}</div>
            <div className="text-xs opacity-80 mt-0.5">{emp.email}</div>
          </button>
        ))}
      </div>

      {/* Selected Employee Leave Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-md border-t-4 border-t-[#D1131B] dark:bg-gray-800 dark:border-gray-700 md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-gray-500 uppercase">Annual Leave Summary</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5 flex flex-col justify-center">
              <div className="flex justify-between text-sm"><span>Balance B/F:</span><span className="font-semibold">{startBfForCurrentYear} Days</span></div>
              <div className="flex justify-between text-sm"><span>Accrued YTD:</span><span className="font-semibold">{liveAccrued} Days</span></div>
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400"><span>Taken/Pending:</span><span className="font-semibold">{totalAnnualDaysTaken} Days</span></div>
            </div>
            <div className="flex flex-col justify-center items-center p-4 bg-green-50/50 dark:bg-green-950/10 rounded-xl border border-green-200/50 dark:border-green-900/50">
              <span className="text-xs text-green-700 dark:text-green-400 font-semibold uppercase">Available Balance</span>
              <span className="text-3xl font-bold text-green-700 dark:text-green-400 mt-1">{annualBalance} Days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><div className="flex items-center gap-2"><Clock className="w-5 h-5 text-yellow-500" /><CardTitle className="text-yellow-600 dark:text-yellow-400">Pending Requests</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pending}</p></CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /><CardTitle className="text-green-600 dark:text-green-400">Approved Requests</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.approved}</p></CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><div className="flex items-center gap-2"><XCircle className="w-5 h-5 text-[#D1131B]" /><CardTitle className="text-[#D1131B]">Rejected Requests</CardTitle></div></CardHeader>
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
                    <TableHead className="whitespace-nowrap text-sm hidden md:table-cell">Date Applied</TableHead>
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
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                        {r.submitted_on ? new Date(r.submitted_on).toLocaleDateString("en-GB") : "—"}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{new Date(r.start_date).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{new Date(r.end_date).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm hidden lg:table-cell">{r.days_applied}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(getDisplayStatus(r))}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end items-center">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400" onClick={() => { setSelectedRequest(r); setViewDialogOpen(true); }}><Eye className="w-4 h-4" /></Button>
                          {canAct(r) && (<>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs h-8 px-2" onClick={() => openReview(r, "Approved")}><CheckCircle className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Approve</span></Button>
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-8 px-2" onClick={() => openReview(r, "Deferred")}><span className="hidden sm:inline">Defer</span><span className="sm:hidden">D</span></Button>
                            <Button size="sm" className="bg-[#D1131B] hover:bg-[#B01018] text-white text-xs h-8 px-2" onClick={() => openReview(r, "Rejected")}><XCircle className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline">Reject</span></Button>
                          </>)}
                          {r.status === "Pending" && !canAct(r) && isRose && (!r.stage1_status || r.stage1_status === "Pending") && (
                            <span className="text-[10px] text-gray-400 italic whitespace-nowrap">Awaiting Esther</span>
                          )}
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
          <DialogHeader>
            <DialogTitle className="dark:text-white">Leave Application Details</DialogTitle>
            <DialogDescription className="sr-only">Detailed view of the selected leave request</DialogDescription>
          </DialogHeader>
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
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Date Applied</p><p className="font-medium dark:text-white">{selectedRequest.submitted_on ? new Date(selectedRequest.submitted_on).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—"}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Start Date</p><p className="font-medium dark:text-white">{new Date(selectedRequest.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">End Date</p><p className="font-medium dark:text-white">{new Date(selectedRequest.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Days Accrued</p><p className="font-medium dark:text-white">{selectedRequest.days_accrued ?? "—"}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Leave Balance</p><p className="font-medium dark:text-white">{selectedRequest.leave_balance ?? "—"}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Balance B/F</p><p className="font-medium dark:text-white">{selectedRequest.balance_bf ?? "—"}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Status</p><div className="mt-1">{getStatusBadge(getDisplayStatus(selectedRequest))}</div></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-500 dark:text-gray-400 text-xs">Employee Signature</p><p className="font-medium dark:text-white">{selectedRequest.employee_signature || "—"}</p></div>
              </div>
              {(selectedRequest.stage1_reviewed_by || selectedRequest.stage2_reviewed_by) && (<>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Stage 1 — Esther</p>
                    {selectedRequest.stage1_reviewed_by ? (<>
                      <p className="font-medium dark:text-white text-sm">{selectedRequest.stage1_status} by {selectedRequest.stage1_reviewed_by}</p>
                      {selectedRequest.stage1_reviewed_on && <p className="text-[11px] text-gray-500">{new Date(selectedRequest.stage1_reviewed_on).toLocaleDateString("en-GB")}</p>}
                      {selectedRequest.stage1_remarks && <p className="text-xs italic dark:text-gray-300 mt-1">"{selectedRequest.stage1_remarks}"</p>}
                    </>) : <p className="text-gray-400 text-sm">Awaiting review</p>}
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Stage 2 — Rose (Final)</p>
                    {selectedRequest.stage2_reviewed_by ? (<>
                      <p className="font-medium dark:text-white text-sm">{selectedRequest.stage2_status} by {selectedRequest.stage2_reviewed_by}</p>
                      {selectedRequest.stage2_reviewed_on && <p className="text-[11px] text-gray-500">{new Date(selectedRequest.stage2_reviewed_on).toLocaleDateString("en-GB")}</p>}
                      {selectedRequest.stage2_remarks && <p className="text-xs italic dark:text-gray-300 mt-1">"{selectedRequest.stage2_remarks}"</p>}
                    </>) : <p className="text-gray-400 text-sm">Awaiting review</p>}
                  </div>
                </div>
                {selectedRequest.deferred_date && <div className="mt-1"><p className="text-gray-500 dark:text-gray-400 text-xs">Deferred To</p><p className="font-medium dark:text-white">{new Date(selectedRequest.deferred_date).toLocaleDateString("en-GB")}</p></div>}
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
            <DialogDescription className="sr-only">Form to approve, defer or reject a leave request</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
              {reviewStage === 1
                ? "You are reviewing this as Esther (Stage 1 of 2). Rose still needs to give the final approval after you."
                : "You are giving the final approval as Rose (Stage 2 of 2)."}
            </div>
            {reviewStage === 2 && selectedRequest?.stage1_reviewed_by && (
              <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-lg px-3 py-2 text-xs">
                <p className="text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Stage 1 — Esther's decision</p>
                <p className="dark:text-gray-200">{selectedRequest.stage1_status} by {selectedRequest.stage1_reviewed_by}</p>
                {selectedRequest.stage1_remarks && <p className="italic mt-1 dark:text-gray-300">"{selectedRequest.stage1_remarks}"</p>}
              </div>
            )}
            {reviewAction === "Deferred" && (
              <div className="grid gap-2"><Label>Deferred Date *</Label><Input type="date" value={reviewData.deferred_date} onChange={e => setReviewData(p => ({ ...p, deferred_date: e.target.value }))} className="dark:bg-gray-700 dark:border-gray-600" /></div>
            )}
            <div className="grid gap-2">
              <Label>Remarks {reviewAction === "Rejected" ? "*" : "(Optional)"}</Label>
              <Textarea value={reviewData.hr_remarks} onChange={e => setReviewData(p => ({ ...p, hr_remarks: e.target.value }))} placeholder={reviewAction === "Rejected" ? "Reason for rejection..." : reviewAction === "Deferred" ? "Reason for deferral..." : "Any notes..."} className="dark:bg-gray-700 dark:border-gray-600" rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>Signature</Label>
              <Input readOnly value={currentUser.name || ""} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" />
              <p className="text-[11px] text-gray-400">Auto-filled from your account — matches who is authorized to review at this stage.</p>
            </div>
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
