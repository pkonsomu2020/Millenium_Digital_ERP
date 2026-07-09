import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock, Eye, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { api } from "../../services/api";
import { toast } from "sonner";

const LEAVE_TYPES = ["ANNUAL", "COMPASSIONATE", "SICKLEAVE", "MATERNITY"];

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
}

const DEFAULT_MANAGER = "Rose Kirwa";

const emptyForm = {
  employee_name: "", employee_email: "", manager: DEFAULT_MANAGER, contact_while_on_leave: "",
  leave_type: "", custom_leave_type: "",
  start_date: "", end_date: "", days_applied: "",
  days_accrued: "", leave_balance: "", balance_bf: "",
  submitted_by: "", employee_signature: "",
};

export function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeEmployee, setActiveEmployee] = useState(ADMIN_EMPLOYEES[0]);

  useEffect(() => { fetchLeaveRequests(); }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getAllLeaveRequests();
      setLeaveRequests(data);
    } catch { toast.error("Failed to load leave requests"); }
    finally { setLoading(false); }
  };

  const isWeekendOrHoliday = (date: Date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) return true; // Sunday or Saturday

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const fixedHolidays = [
      `01-01`, // New Year
      `05-01`, // Labour Day
      `06-01`, // Madaraka Day
      `10-10`, // Huduma Day
      `10-20`, // Mashujaa Day
      `12-12`, // Jamhuri Day
      `12-25`, // Christmas Day
      `12-26`  // Boxing Day
    ];
    const md = `${m}-${d}`;
    if (fixedHolidays.includes(md)) return true;

    const variableHolidays = [
      "2025-04-18", "2025-04-21", "2025-03-31", "2025-06-07",
      "2026-04-03", "2026-04-06", "2026-03-20", "2026-05-27",
      "2027-03-26", "2027-03-29", "2027-03-10", "2027-05-17"
    ];

    if (variableHolidays.includes(dateStr)) return true;
    return false;
  };

  const calcDays = (s: string, e: string, leaveType: string) => {
    if (!s || !e) return 0;
    const start = new Date(s);
    const end = new Date(e);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (start > end) return 0;

    const normalizedType = leaveType ? leaveType.toUpperCase() : "";
    if (normalizedType === "ANNUAL" || normalizedType === "ANNUAL LEAVE") {
      let workingDays = 0;
      let current = new Date(start);
      while (current <= end) {
        if (!isWeekendOrHoliday(current)) {
          workingDays++;
        }
        current.setDate(current.getDate() + 1);
      }
      return workingDays;
    } else {
      const diff = end.getTime() - start.getTime();
      return Math.ceil(diff / 86400000) + 1;
    }
  };

  const setF = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));



  const calculateLeaveBalances = (
    employee: typeof ADMIN_EMPLOYEES[0],
    leaveType: string,
    startDate: string,
    daysApplied: number,
    requestId: string | null = null
  ) => {
    const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
    const normalizedType = leaveType ? leaveType.toUpperCase() : "";

    if (normalizedType !== "ANNUAL" && normalizedType !== "ANNUAL LEAVE") {
      return { calculatedAccrued: 0, calculatedBf: 0, calculatedBalance: 0 };
    }

    // Total annual entitlement is always 21 days per year
    const ANNUAL_ENTITLEMENT = 21;

    // Days Accrued = month number × 1.75 (pro-rata accrual)
    const month = startDate ? new Date(startDate).getMonth() + 1 : new Date().getMonth() + 1;
    const calculatedAccrued = month * 1.75;

    // Balance B/F = 0 in the current year (resets each year)
    const calculatedBf = 0;

    // Sum days from all OTHER approved/pending annual leave requests this year
    const prevAnnualDaysTaken = leaveRequests
      .filter(r =>
        r.employee_email === employee.email &&
        r.id !== requestId &&
        r.status !== "Rejected" &&
        (r.leave_type === "ANNUAL" || r.leave_type === "Annual Leave") &&
        new Date(r.start_date).getFullYear() === year
      )
      .reduce((sum, r) => sum + r.days_applied, 0);

    // Leave Balance = 21 - total annual days taken this year (including this request)
    const calculatedBalance = ANNUAL_ENTITLEMENT - prevAnnualDaysTaken - daysApplied;

    return { calculatedAccrued, calculatedBf, calculatedBalance };
  };

  useEffect(() => {
    if (createDialogOpen || editDialogOpen) {
      const days = calcDays(form.start_date, form.end_date, form.leave_type);
      const employee = ADMIN_EMPLOYEES.find(e => e.email === form.employee_email) || activeEmployee;
      const metrics = calculateLeaveBalances(employee, form.leave_type, form.start_date, days, selectedRequest?.id);

      setForm(p => {
        const isAnnual = form.leave_type === "ANNUAL";
        const newDaysAccrued = isAnnual ? String(metrics.calculatedAccrued) : "";
        const newBf = isAnnual ? String(metrics.calculatedBf) : "";
        const newBalance = isAnnual ? String(metrics.calculatedBalance) : "";
        const newDaysApplied = String(days);

        if (
          p.days_applied !== newDaysApplied ||
          p.days_accrued !== newDaysAccrued ||
          p.balance_bf !== newBf ||
          p.leave_balance !== newBalance
        ) {
          return {
            ...p,
            days_applied: newDaysApplied,
            days_accrued: newDaysAccrued,
            balance_bf: newBf,
            leave_balance: newBalance
          };
        }
        return p;
      });
    }
  }, [form.start_date, form.end_date, form.leave_type, form.employee_email, createDialogOpen, editDialogOpen, leaveRequests, selectedRequest]);

  const handleCreate = async () => {
    if (!form.employee_name.trim()) { toast.error("Please fill in Employee Name"); return; }
    if (!form.employee_email.trim()) { toast.error("Please fill in Employee Email"); return; }
    if (!form.leave_type) { toast.error("Please select a Type of Leave"); return; }
    if (form.leave_type === "Others" && !form.custom_leave_type.trim()) { toast.error("Please specify the leave type"); return; }
    if (!form.start_date) { toast.error("Please select a Start Date"); return; }
    if (!form.end_date) { toast.error("Please select an End Date"); return; }
    if (!form.submitted_by.trim()) { toast.error("Please fill in Submitted By"); return; }
    try {
      setSubmitting(true);
      await api.createLeaveRequest({
        ...form,
        manager: DEFAULT_MANAGER,
        reason: "",
        handover_reviewed: false,
        handover_notes: null,
        days_applied: calcDays(form.start_date, form.end_date, form.leave_type),
        days_accrued: form.days_accrued ? parseFloat(form.days_accrued) : null,
        leave_balance: form.leave_balance ? parseFloat(form.leave_balance) : null,
        balance_bf: form.balance_bf ? parseFloat(form.balance_bf) : null,
        custom_leave_type: form.leave_type === "Others" ? form.custom_leave_type : null,
      });
      toast.success("Leave request submitted successfully");
      setCreateDialogOpen(false);
      setForm(emptyForm);
      fetchLeaveRequests();
    } catch { toast.error("Failed to submit leave request"); }
    finally { setSubmitting(false); }
  };

  const openEditDialog = (r: LeaveRequest) => {
    const normalizeLeaveType = (type: string) => {
      const u = type ? type.toUpperCase() : "";
      if (u.includes("ANNUAL")) return "ANNUAL";
      if (u.includes("COMPASSIONATE")) return "COMPASSIONATE";
      if (u.includes("SICK")) return "SICKLEAVE";
      if (u.includes("MATERNITY")) return "MATERNITY";
      return type;
    };
    setSelectedRequest(r);
    setForm({
      employee_name: r.employee_name,
      employee_email: r.employee_email,
      manager: r.manager || DEFAULT_MANAGER,
      contact_while_on_leave: r.contact_while_on_leave || "",
      leave_type: normalizeLeaveType(r.leave_type),
      custom_leave_type: r.custom_leave_type || "",
      start_date: r.start_date.split("T")[0],
      end_date: r.end_date.split("T")[0],
      days_applied: String(r.days_applied),
      days_accrued: r.days_accrued != null ? String(r.days_accrued) : "",
      leave_balance: r.leave_balance != null ? String(r.leave_balance) : "",
      balance_bf: r.balance_bf != null ? String(r.balance_bf) : "",
      submitted_by: r.submitted_by,
      employee_signature: r.employee_signature || "",
    });
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedRequest) return;
    if (!form.employee_name.trim()) { toast.error("Please fill in Employee Name"); return; }
    if (!form.employee_email.trim()) { toast.error("Please fill in Employee Email"); return; }
    if (!form.leave_type) { toast.error("Please select a Type of Leave"); return; }
    if (form.leave_type === "Others" && !form.custom_leave_type.trim()) { toast.error("Please specify the leave type"); return; }
    if (!form.start_date) { toast.error("Please select a Start Date"); return; }
    if (!form.end_date) { toast.error("Please select an End Date"); return; }
    if (!form.submitted_by.trim()) { toast.error("Please fill in Submitted By"); return; }
    try {
      setSubmitting(true);
      await api.updateLeaveRequest(selectedRequest.id, {
        ...form,
        manager: DEFAULT_MANAGER,
        reason: "",
        handover_reviewed: false,
        handover_notes: null,
        days_applied: calcDays(form.start_date, form.end_date, form.leave_type),
        days_accrued: form.days_accrued ? parseFloat(form.days_accrued) : null,
        leave_balance: form.leave_balance ? parseFloat(form.leave_balance) : null,
        balance_bf: form.balance_bf ? parseFloat(form.balance_bf) : null,
        custom_leave_type: form.leave_type === "Others" ? form.custom_leave_type : null,
      });
      toast.success("Leave request updated successfully");
      setEditDialogOpen(false);
      setForm(emptyForm);
      fetchLeaveRequests();
    } catch { toast.error("Failed to update leave request"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete leave request from ${name}?`)) return;
    try {
      await api.deleteLeaveRequest(id);
      toast.success("Deleted successfully");
      fetchLeaveRequests();
    } catch { toast.error("Failed to delete"); }
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
  const totalAnnualDaysTaken = activeEmployeeRequests
    .filter(r => (r.leave_type === "ANNUAL" || r.leave_type === "Annual Leave") && r.status !== "Rejected" && new Date(r.start_date).getFullYear() === currentYear)
    .reduce((sum, r) => sum + r.days_applied, 0);

  // Accrued YTD = current month × 1.75
  const liveAccrued = (new Date().getMonth() + 1) * 1.75;

  // Total annual entitlement is 21 days; Available Balance = 21 - days taken
  const ANNUAL_ENTITLEMENT = 21;
  const annualBalance = ANNUAL_ENTITLEMENT - totalAnnualDaysTaken;

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

      {/* Selected Employee Live Stats Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Annual Entitlement</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-gray-800 dark:text-white">{ANNUAL_ENTITLEMENT} Days</p></CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Accrued YTD (1.75/mo)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-gray-800 dark:text-white">{liveAccrued} Days</p></CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Days Taken</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalAnnualDaysTaken} Days</p></CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700 bg-green-50/30 dark:bg-green-950/10 border-green-200 dark:border-green-900">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">Available Balance</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-700 dark:text-green-400">{annualBalance} Days</p></CardContent>
        </Card>
      </div>

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

      {/* Search + New */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by employee name or leave type..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white whitespace-nowrap" onClick={() => {
          setForm({
            ...emptyForm,
            employee_name: activeEmployee.name,
            employee_email: activeEmployee.email,
          });
          setCreateDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" /> New Leave Request
        </Button>
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
                      <TableCell className="text-center">{getStatusBadge(r.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400" onClick={() => { setSelectedRequest(r); setViewDialogOpen(true); }} title="View"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-yellow-500 dark:text-yellow-400" onClick={() => openEditDialog(r)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(r.id, r.employee_name)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[680px] dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold dark:text-white">Leave Application Form</DialogTitle>
            <DialogDescription className="sr-only">Form to submit a new leave request</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Employee Name *</Label><Input readOnly value={form.employee_name} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
              <div className="grid gap-2"><Label>Employee Email *</Label><Input readOnly type="email" value={form.employee_email} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Contact While on Leave</Label><Input value={form.contact_while_on_leave} onChange={e => setF("contact_while_on_leave", e.target.value)} placeholder="Phone number" className="dark:bg-gray-700 dark:border-gray-600" /></div>
            </div>

            <Separator />

            {/* Leave Type */}
            <div className="grid gap-2">
              <Label>Type of Leave *</Label>
              <Select value={form.leave_type} onValueChange={v => setF("leave_type", v)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>{LEAVE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.leave_type === "Others" && (
              <div className="grid gap-2"><Label>Specify Leave Type *</Label><Input value={form.custom_leave_type} onChange={e => setF("custom_leave_type", e.target.value)} placeholder="e.g. Study Leave, Unpaid Leave..." className="dark:bg-gray-700 dark:border-gray-600" /></div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setF("start_date", e.target.value)} className="dark:bg-gray-700 dark:border-gray-600" /></div>
              <div className="grid gap-2"><Label>End Date *</Label><Input type="date" value={form.end_date} min={form.start_date} onChange={e => setF("end_date", e.target.value)} className="dark:bg-gray-700 dark:border-gray-600" /></div>
              <div className="grid gap-2"><Label>Days Applied</Label><Input readOnly value={form.start_date && form.end_date ? calcDays(form.start_date, form.end_date, form.leave_type) : ""} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
            </div>

            {/* Leave Balances */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Days Accrued</Label><Input readOnly value={form.days_accrued} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
              <div className="grid gap-2"><Label>Leave Balance</Label><Input readOnly value={form.leave_balance} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
              <div className="grid gap-2"><Label>Balance B/F</Label><Input readOnly value={form.balance_bf} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
            </div>

            <Separator />

            {/* Submission */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Submitted By *</Label><Input value={form.submitted_by} onChange={e => setF("submitted_by", e.target.value)} placeholder="Your name" className="dark:bg-gray-700 dark:border-gray-600" /></div>
              <div className="grid gap-2"><Label>Employee Signature</Label><Input value={form.employee_signature} onChange={e => setF("employee_signature", e.target.value)} placeholder="Type full name as signature" className="dark:bg-gray-700 dark:border-gray-600" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white" onClick={handleCreate} disabled={submitting}>{submitting ? "Submitting..." : "Submit Application"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={v => { setEditDialogOpen(v); if (!v) setForm(emptyForm); }}>
        <DialogContent className="sm:max-w-[680px] dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold dark:text-white">Edit Leave Application</DialogTitle>
            <DialogDescription className="sr-only">Form to modify an existing leave request</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Employee Name *</Label><Input readOnly value={form.employee_name} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
              <div className="grid gap-2"><Label>Employee Email *</Label><Input readOnly type="email" value={form.employee_email} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Contact While on Leave</Label><Input value={form.contact_while_on_leave} onChange={e => setF("contact_while_on_leave", e.target.value)} className="dark:bg-gray-700 dark:border-gray-600" /></div>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label>Type of Leave *</Label>
              <Select value={form.leave_type} onValueChange={v => setF("leave_type", v)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600"><SelectValue /></SelectTrigger>
                <SelectContent>{LEAVE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.leave_type === "Others" && (
              <div className="grid gap-2"><Label>Specify Leave Type *</Label><Input value={form.custom_leave_type} onChange={e => setF("custom_leave_type", e.target.value)} className="dark:bg-gray-700 dark:border-gray-600" /></div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setF("start_date", e.target.value)} className="dark:bg-gray-700 dark:border-gray-600" /></div>
              <div className="grid gap-2"><Label>End Date *</Label><Input type="date" value={form.end_date} min={form.start_date} onChange={e => setF("end_date", e.target.value)} className="dark:bg-gray-700 dark:border-gray-600" /></div>
              <div className="grid gap-2"><Label>Days Applied</Label><Input readOnly value={form.start_date && form.end_date ? calcDays(form.start_date, form.end_date, form.leave_type) : ""} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Days Accrued</Label><Input readOnly value={form.days_accrued} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
              <div className="grid gap-2"><Label>Leave Balance</Label><Input readOnly value={form.leave_balance} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
              <div className="grid gap-2"><Label>Balance B/F</Label><Input readOnly value={form.balance_bf} className="dark:bg-gray-600 dark:border-gray-700 bg-gray-100 dark:text-gray-300 text-gray-500 cursor-not-allowed" /></div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Submitted By *</Label><Input value={form.submitted_by} onChange={e => setF("submitted_by", e.target.value)} className="dark:bg-gray-700 dark:border-gray-600" /></div>
              <div className="grid gap-2"><Label>Employee Signature</Label><Input value={form.employee_signature} onChange={e => setF("employee_signature", e.target.value)} className="dark:bg-gray-700 dark:border-gray-600" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setForm(emptyForm); }} disabled={submitting}>Cancel</Button>
            <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white" onClick={handleEdit} disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
