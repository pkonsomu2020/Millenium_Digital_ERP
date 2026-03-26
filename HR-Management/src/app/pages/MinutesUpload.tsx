import { useState, useEffect } from "react";
import { Search, FileText, Download, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMinutes();
  }, []);

  const fetchMinutes = async () => {
    try {
      setLoading(true);
      const data = await api.getAllMinutes();
      setMinutes(data);
    } catch (error) {
      console.error("Error fetching minutes:", error);
      toast.error("Failed to load meeting minutes");
    } finally {
      setLoading(false);
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

  const filteredMinutes = minutes.filter((minute) => {
    const matchesSearch = minute.meeting_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          minute.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          minute.original_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group by year and month
  const groupedMinutes = filteredMinutes.reduce((acc, minute) => {
    const date = new Date(minute.meeting_date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[yearMonth]) {
      acc[yearMonth] = [];
    }
    acc[yearMonth].push(minute);
    return acc;
  }, {} as Record<string, MeetingMinutes[]>);

  const sortedYearMonths = Object.keys(groupedMinutes).sort().reverse();

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meeting Minutes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View meeting minutes for Millenium Solutions
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Minutes</p>
            <p className="text-3xl font-bold text-[#D1131B]">{minutes.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Year</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {minutes.filter(m => new Date(m.meeting_date).getFullYear() === new Date().getFullYear()).length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {minutes.filter(m => {
                const date = new Date(m.meeting_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <Input
            placeholder="Search meeting minutes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Minutes by Month */}
      {loading ? (
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-8 text-center text-gray-500">
            Loading meeting minutes...
          </CardContent>
        </Card>
      ) : filteredMinutes.length === 0 ? (
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-8 text-center text-gray-500">
            No meeting minutes found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedYearMonths.map((yearMonth) => {
            const [year, month] = yearMonth.split('-');
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            return (
              <Card key={yearMonth} className="shadow-md dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                  <CardTitle className="text-lg sm:text-xl text-[#374151] dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {monthName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                          <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm">Meeting Title</TableHead>
                          <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm">Meeting Date</TableHead>
                          <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm hidden md:table-cell">File Name</TableHead>
                          <TableHead className="font-semibold text-[#374151] dark:text-gray-200 whitespace-nowrap text-sm hidden lg:table-cell">Uploaded By</TableHead>
                          <TableHead className="font-semibold text-[#374151] dark:text-gray-200 text-right whitespace-nowrap text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedMinutes[yearMonth].map((minute) => (
                          <TableRow key={minute.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <TableCell className="text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[#D1131B] flex-shrink-0" />
                                <span className="text-gray-900 dark:text-white font-medium">{minute.meeting_title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap">
                              {new Date(minute.meeting_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm hidden md:table-cell">
                              <span className="truncate max-w-[200px] block">{minute.original_name}</span>
                              <span className="text-xs text-gray-500">{formatFileSize(minute.file_size)}</span>
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                              {minute.uploaded_by}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 sm:gap-2 justify-end">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-8 w-8 p-0"
                                  onClick={() => handleView(minute.file_url)}
                                  title="View"
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 h-8 w-8 p-0"
                                  onClick={() => handleDownload(minute.file_url, minute.original_name)}
                                  title="Download"
                                >
                                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
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
    </div>
  );
}
