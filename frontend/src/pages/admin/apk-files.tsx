"use client";

import * as React from "react";
import { z } from "zod";
import { format } from "date-fns";
import { useNavigate } from "react-router";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  MoreVerticalIcon,
  PlusIcon,
  FilterIcon,
  FileIcon,
  FolderIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Schema based on the ApkFile model from Rust
export const ApkFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  path: z.string(),
  size_bytes: z.number(),
  checksum_sha256: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

type ApkFile = z.infer<typeof ApkFileSchema>;

// Sample data for demonstration
const mockApkFiles: ApkFile[] = [
  {
    id: 1,
    name: "apkraft-manager-v1.0.0.apk",
    path: "/uploads/apk-files/apkraft-manager-v1.0.0.apk",
    size_bytes: 15728640, // 15MB
    checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    created_at: new Date(2023, 0, 15).toISOString(),
    updated_at: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 2,
    name: "apkraft-dashboard-v0.5.0.apk",
    path: "/uploads/apk-files/apkraft-dashboard-v0.5.0.apk",
    size_bytes: 10485760, // 10MB
    checksum_sha256: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    created_at: new Date(2023, 1, 20).toISOString(),
    updated_at: new Date(2023, 1, 20).toISOString(),
  },
  {
    id: 3,
    name: "apkraft-manager-v1.0.1.apk",
    path: "/uploads/apk-files/apkraft-manager-v1.0.1.apk",
    size_bytes: 16252928, // 15.5MB
    checksum_sha256: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
    created_at: new Date(2023, 2, 10).toISOString(),
    updated_at: new Date(2023, 2, 10).toISOString(),
  },
  {
    id: 4,
    name: "apkraft-mobile-v2.0.0.apk",
    path: "/uploads/apk-files/apkraft-mobile-v2.0.0.apk",
    size_bytes: 18874368, // 18MB
    checksum_sha256: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
    created_at: new Date(2023, 3, 5).toISOString(),
    updated_at: new Date(2023, 3, 5).toISOString(),
  },
  {
    id: 5,
    name: "apkraft-dashboard-v0.6.0.apk",
    path: "/uploads/apk-files/apkraft-dashboard-v0.6.0.apk",
    size_bytes: 11534336, // 11MB
    checksum_sha256: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    created_at: new Date(2023, 4, 15).toISOString(),
    updated_at: new Date(2023, 4, 15).toISOString(),
  },
];

export default function ApkFilesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [visibleColumns, setVisibleColumns] = React.useState({
    name: true,
    size: true,
    checksum: true,
    created: true,
    actions: true,
  });
  const [copiedChecksum, setCopiedChecksum] = React.useState<number | null>(null);
  
  // Page size for pagination
  const pageSize = 10;
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const units = ['KB', 'MB', 'GB'];
    let size = bytes / 1024;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return size.toFixed(1) + ' ' + units[unitIndex];
  };
  
  // Format SHA256 checksum for display
  const formatChecksum = (checksum: string) => {
    return `${checksum.substring(0, 8)}...${checksum.substring(checksum.length - 8)}`;
  };
  
  // Copy checksum to clipboard
  const copyToClipboard = (id: number, checksum: string) => {
    navigator.clipboard.writeText(checksum)
      .then(() => {
        setCopiedChecksum(id);
        setTimeout(() => setCopiedChecksum(null), 2000);
        toast("Copied", {
          description: "Checksum copied to clipboard",
        });
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Filter APK files based on search term
  const filteredApkFiles = mockApkFiles.filter(file => {
    return file.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredApkFiles.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedApkFiles = filteredApkFiles.slice(startIndex, startIndex + pageSize);
  
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">APK Files</h1>
        <Button onClick={() => navigate("/admin/apk-files/create")} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload APK
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10">
                  <ColumnsIcon className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.name}
                  onCheckedChange={(checked) =>
                    setVisibleColumns({ ...visibleColumns, name: !!checked })
                  }
                >
                  Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.size}
                  onCheckedChange={(checked) =>
                    setVisibleColumns({ ...visibleColumns, size: !!checked })
                  }
                >
                  Size
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.checksum}
                  onCheckedChange={(checked) =>
                    setVisibleColumns({ ...visibleColumns, checksum: !!checked })
                  }
                >
                  Checksum
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.created}
                  onCheckedChange={(checked) =>
                    setVisibleColumns({ ...visibleColumns, created: !!checked })
                  }
                >
                  Created
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.actions}
                  onCheckedChange={(checked) =>
                    setVisibleColumns({ ...visibleColumns, actions: !!checked })
                  }
                >
                  Actions
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.name && <TableHead>File Name</TableHead>}
              {visibleColumns.size && <TableHead className="text-right">Size</TableHead>}
              {visibleColumns.checksum && <TableHead>SHA256 Checksum</TableHead>}
              {visibleColumns.created && <TableHead>Created</TableHead>}
              {visibleColumns.actions && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApkFiles.length > 0 ? (
              paginatedApkFiles.map((file) => (
                <TableRow key={file.id}>
                  {visibleColumns.name && (
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-xs">{file.path}</div>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.size && (
                    <TableCell className="text-right">
                      <span className="font-mono">{formatFileSize(file.size_bytes)}</span>
                    </TableCell>
                  )}
                  {visibleColumns.checksum && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted p-1 text-xs rounded">{formatChecksum(file.checksum_sha256)}</code>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(file.id, file.checksum_sha256)}
                        >
                          {copiedChecksum === file.id ? (
                            <CheckIcon className="h-3 w-3 text-green-500" />
                          ) : (
                            <CopyIcon className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.created && (
                    <TableCell>
                      {format(new Date(file.created_at), "MMM dd, yyyy")}
                    </TableCell>
                  )}
                  {visibleColumns.actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVerticalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/apk-files/${file.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download APK
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              console.log(`Delete file ${file.id}`);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={Object.values(visibleColumns).filter(Boolean).length} 
                  className="h-24 text-center"
                >
                  No APK files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredApkFiles.length)} of {filteredApkFiles.length} files
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}