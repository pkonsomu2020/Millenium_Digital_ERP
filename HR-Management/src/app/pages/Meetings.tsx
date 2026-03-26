import { useState, useEffect } from "react";
import { Search, Calendar as CalendarIcon, Clock, Users, MapPin, Eye } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { api } from "../../services/api";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  agenda: string | null;
  meeting_date: string;
  meeting_time: string;
  duration: string | null;
  location: string | null;
  participants: string[];
  status: "Upcoming" | "Completed" | "Cancelled";
  created_by: string;
}

export function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Meeting | null>(null);

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.getAllMeetings();
      setMeetings(data);
    } catch { toast.error("Failed to load meetings"); }
    finally { setLoading(false); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { Upcoming: "bg-green-500", Completed: "bg-gray-500", Cancelled: "bg-red-500" };
    return <Badge className={`${map[s] || "bg-gray-400"} text-white text-xs`}>{s}</Badge>;
  };

  const filtered = meetings.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const thisWeek = (() => {
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return meetings.filter(m => { const d = new Date(m.meeting_date); return d >= start && d <= end; }).length;
  })();

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><CardTitle className="text-base text-gray-700 dark:text-gray-200">Total Meetings</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-gray-800 dark:text-white">{meetings.length}</p></CardContent>
        </Card>
        <Card className="shadow-md border-2 border-green-500 dark:bg-gray-800">
          <CardHeader className="pb-3"><div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-green-500" /><CardTitle className="text-base text-green-600 dark:text-green-400">Upcoming</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600 dark:text-green-400">{meetings.filter(m => m.status === "Upcoming").length}</p></CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3"><div className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /><CardTitle className="text-base text-blue-600 dark:text-blue-400">This Week</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{thisWeek}</p></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search meetings..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div className="space-y-8">
        {/* Calendar */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#374151] dark:text-white">Calendar View</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Meetings shown on their scheduled dates</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-5 h-5" /></Button>
              <span className="font-bold text-base min-w-[130px] text-center text-[#374151] dark:text-white">{format(currentMonth, "MMMM yyyy")}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-5 h-5" /></Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">Today</Button>
            </div>
          </div>
          <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
            <CardContent className="p-0 sm:p-4">
              <div className="w-full flex justify-center pb-4">
                <DayPicker
                  mode="single"
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="border-0 w-full"
                  classNames={{
                    months: "w-full", month: "w-full", caption: "hidden",
                    table: "w-full border-collapse",
                    head_row: "grid grid-cols-7 w-full bg-gray-50/50 dark:bg-gray-800/30",
                    head_cell: "text-gray-500 font-semibold text-sm py-4 text-center w-full",
                    row: "grid grid-cols-7 w-full border-t border-gray-100 dark:border-gray-700/50",
                    cell: "w-full text-sm p-0 relative min-h-[90px] sm:min-h-[120px] border-l first:border-l-0 border-gray-100 dark:border-gray-700/50",
                    day: "h-full w-full p-2 font-normal hover:bg-gray-50 dark:hover:bg-gray-700/50 flex flex-col items-start transition-colors rounded-none outline-none",
                    day_today: "bg-orange-50/30 dark:bg-orange-900/10 border-t-2 border-orange-300 dark:border-orange-700",
                    day_outside: "opacity-30 bg-gray-50/30",
                  }}
                  components={{
                    DayContent: (props) => {
                      const dateStr = props.date.toISOString().split("T")[0];
                      const dayMeetings = meetings.filter(m => m.meeting_date === dateStr);
                      return (
                        <div className="w-full h-full flex flex-col items-start text-left">
                          <span className={`text-sm mb-1 text-gray-600 dark:text-gray-300 ${props.activeModifiers.today ? "text-orange-600 font-semibold" : ""}`}>
                            {format(props.date, "d")}
                          </span>
                          <div className="flex-1 w-full space-y-1 overflow-hidden">
                            {dayMeetings.slice(0, 2).map((m, i) => (
                              <div key={i} className="text-[10px] sm:text-xs truncate w-full px-1 py-0.5 rounded bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-100 dark:border-green-800/50">
                                {m.meeting_time.slice(0, 5)} {m.title}
                              </div>
                            ))}
                            {dayMeetings.length > 2 && <div className="text-[10px] text-gray-400">+{dayMeetings.length - 2} more</div>}
                          </div>
                        </div>
                      );
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* All Meetings */}
        <section>
          <h2 className="text-xl font-bold text-[#374151] dark:text-white mb-4">All Meetings</h2>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No meetings found</p>
          ) : (
            <div className="space-y-3">
              {filtered.map(m => (
                <Card key={m.id} className="shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          {statusBadge(m.status)}
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                            <Users className="w-3 h-3 mr-1 inline" />Meeting
                          </Badge>
                        </div>
                        <h3 className="text-base font-semibold text-[#374151] dark:text-white">{m.title}</h3>
                        {m.agenda && <p className="text-sm text-gray-500 dark:text-gray-400">{m.agenda}</p>}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.meeting_date).toLocaleDateString("en-GB")} • {m.meeting_time.slice(0, 5)}{m.duration ? ` (${m.duration})` : ""}</span>
                          {m.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location}</span>}
                          {m.participants?.length > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{m.participants.length} attendee{m.participants.length !== 1 ? "s" : ""}</span>}
                          <span className="text-gray-400">Created by {m.created_by}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 self-start sm:self-center" onClick={() => { setSelected(m); setViewOpen(true); }} title="View">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">Meeting Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="grid gap-3 py-4 text-sm">
              <div>{statusBadge(selected.status)}</div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Title</p><p className="font-medium dark:text-white">{selected.title}</p></div>
              {selected.agenda && <div><p className="text-xs text-gray-500 dark:text-gray-400">Agenda</p><p className="font-medium dark:text-white">{selected.agenda}</p></div>}
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Date</p><p className="font-medium dark:text-white">{new Date(selected.meeting_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Time</p><p className="font-medium dark:text-white">{selected.meeting_time.slice(0, 5)}</p></div>
                {selected.duration && <div><p className="text-xs text-gray-500 dark:text-gray-400">Duration</p><p className="font-medium dark:text-white">{selected.duration}</p></div>}
                {selected.location && <div><p className="text-xs text-gray-500 dark:text-gray-400">Location</p><p className="font-medium dark:text-white">{selected.location}</p></div>}
              </div>
              {selected.participants?.length > 0 && <div><p className="text-xs text-gray-500 dark:text-gray-400">Participants</p><p className="font-medium dark:text-white">{selected.participants.join(", ")}</p></div>}
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Created By</p><p className="font-medium dark:text-white">{selected.created_by}</p></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
