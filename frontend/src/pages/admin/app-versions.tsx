"use client";

import * as React from "react";
import { z } from "zod";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router";
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
  ExternalLinkIcon,
  DownloadIcon,
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

// Schema based on the AppVersion model from Rust
export const AppVersionSchema = z.object({
  id: z.number(),
  version_code: z.string(),
  version_name: z.string(),
  release_notes: z.string().nullable(),
  published_at: z.string().nullable(),
  app_id: z.number(),
  apk_file_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  // App information for display
  app_name: z.string(),
  bundle_id: z.string(),
  file_size: z.number(), // in bytes
});

type AppVersion = z.infer<typeof AppVersionSchema>;

// Sample data for demonstration
const mockVersions: AppVersion[] = [
  {
    id: 1,
    version_code: "10",
    version_name: "1.0.0",
    release_notes: "Initial release with core functionality.",
    published_at: new Date(2023, 0, 20).toISOString(),
    app_id: 1,
    apk_file_id: 101,
    created_at: new Date(2023, 0, 15).toISOString(),
    updated_at: new Date(2023, 0, 20).toISOString(),
    app_name: "APKraft Manager",
    bundle_id: "com.apkraft.manager",
    file_size: 15728640, // 15MB
  },
  {
    id: 2,
    version_code: "11",
    version_name: "1.0.1",
    release_notes: "Bug fixes and performance improvements.",
    published_at: new Date(2023, 1, 5).toISOString(),
    app_id: 1,
    apk_file_id: 102,
    created_at: new Date(2023, 1, 1).toISOString(),
    updated_at: new Date(2023, 1, 5).toISOString(),
    app_name: "APKraft Manager",
    bundle_id: "com.apkraft.manager",
    file_size: 16252928, // 15.5MB
  },
  {
    id: 3,
    version_code: "20",
    version_name: "2.0.0",
    release_notes: "Major update with new UI and features.",
    published_at: new Date(2023, 2, 15).toISOString(),
    app_id: 1,
    apk_file_id: 103,
    created_at: new Date(2023, 2, 10).toISOString(),
    updated_at: new Date(2023, 2, 15).toISOString(),
    app_name: "APKraft Manager",
    bundle_id: "com.apkraft.manager",
    file_size: 18874368, // 18MB
  },
  {
    id: 4,
    version_code: "5",
    version_name: "0.5.0",
    release_notes: "Beta release for testing.",
    published_at: null, // Not published yet
    app_id: 2,
    apk_file_id: 104,
    created_at: new Date(2023, 3, 1).toISOString(),
    updated_at: new Date(2023, 3, 1).toISOString(),
    app_name: "APKraft Dashboard",
    bundle_id: "com.apkraft.dashboard",
    file_size: 10485760, // 10MB
  },
  {
    id: 5,
    version_code: "6",
    version_name: "0.6.0",
    release_notes: null,
    published_at: null, // Not published yet
    app_id: 2,
    apk_file_id: 105,
    created_at: new Date(2023, 3, 20).toISOString(),
    updated_at: new Date(2023, 3, 20).toISOString(),
    app_name: "APKraft Dashboard",
    bundle_id: "com.apkraft.dashboard",
    file_size: 11534336, // 11MB
  },
];

export default function AppVersionsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [appFilter, setAppFilter] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [visibleColumns, setVisibleColumns] = React.useState({
    version: true,
    app: true,
    publishedAt: true,
    size: true,
    actions: true,
  });

  // Page size for pagination
  const pageSize = 10;

  // Filter app versions based on search term and app filter
  const filteredVersions = mockVersions.filter(version => {
    // Check if version matches search term
    const matchesSearch =
      version.version_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.bundle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (version.release_notes && version.release_notes.toLowerCase().includes(searchTerm.toLowerCase()));

    // Check if version matches app filter
    const matchesAppFilter = appFilter ? version.app_id.toString() === appFilter : true;

    return matchesSearch && matchesAppFilter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredVersions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedVersions = filteredVersions.slice(startIndex, startIndex + pageSize);

  // Get unique apps for filter dropdown
  const uniqueApps = Array.from(new Set(mockVersions.map(v => v.app_id)))
    .map(appId => {
      const version = mockVersions.find(v => v.app_id === appId);
      return {
        id: appId,
        name: version ? version.app_name : `App ${appId}`,
      };
    });

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

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">App Versions</h1>
        <Button onClick={() => navigate("/admin/app-versions/create")} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Version
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Versions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search versions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-[220px]">
              <Select
                value={appFilter}
                onValueChange={(value) => {
                  setAppFilter(value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by app" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apk">All Apps</SelectItem>
                  {uniqueApps.map((app) => (
                    <SelectItem key={app.id} value={app.id.toString()}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  checked={visibleColumns.version}
                  onCheckedChange={(checked) =>
                    setVisibleColumns({ ...visibleColumns, version: !!checked })
                  }
                >
                  Version
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.app}
                  onCheckedChange={(checked) =>
                    setVisibleColumns({ ...visibleColumns, app: !!checked })
                  }
                >
                  App
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleColumns.publishedAt}
                  onCheckedChange={(checked) =>
                    setVisibleColumns({ ...visibleColumns, publishedAt: !!checked })
                  }
                >
                  Published
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
              {visibleColumns.version && <TableHead>Version</TableHead>}
              {visibleColumns.app && <TableHead>App</TableHead>}
              {visibleColumns.publishedAt && <TableHead>Published</TableHead>}
              {visibleColumns.size && <TableHead className="text-right">Size</TableHead>}
              {visibleColumns.actions && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVersions.length > 0 ? (
              paginatedVersions.map((version) => (
                <TableRow key={version.id}>
                  {visibleColumns.version && (
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {version.version_name}
                          <Badge variant="outline" className="text-xs">
                            {version.version_code}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {version.release_notes ? (
                            <div className="line-clamp-1">{version.release_notes}</div>
                          ) : (
                            <span className="italic">No release notes</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.app && (
                    <TableCell>
                      <div>
                        <div className="font-medium">{version.app_name}</div>
                        <div className="text-xs text-muted-foreground">{version.bundle_id}</div>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.publishedAt && (
                    <TableCell>
                      {version.published_at ? (
                        format(new Date(version.published_at), "MMM dd, yyyy")
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800/30">
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.size && (
                    <TableCell className="text-right">
                      <span className="font-mono">{formatFileSize(version.file_size)}</span>
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
                            onClick={() => navigate(`/admin/app-versions/${version.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/app-versions/${version.id}/edit`)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download APK
                          </DropdownMenuItem>
                          {!version.published_at && (
                            <DropdownMenuItem>
                              <ExternalLinkIcon className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              console.log(`Delete version ${version.id}`);
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
                  No versions found.
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
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredVersions.length)} of {filteredVersions.length} versions
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
