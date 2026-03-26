import { useState, useEffect } from "react";
import { Search, FileText, Download, Eye } from "lucide-react";
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

      {/* Search Bar */}
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
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
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
                        <div className="flex gap-1 sm:gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-8 w-8 p-0"
                            onClick={() => handleView(doc.file_url)}
                            title="View"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 h-8 w-8 p-0"
                            onClick={() => handleDownload(doc.file_url, doc.original_name)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
