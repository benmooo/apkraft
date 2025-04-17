"use client";

import * as React from "react";
import { z } from "zod";
import { format } from "date-fns";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  SearchIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  InfoIcon,
  BugIcon,
  ExternalLinkIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

// Log level type and styles
type LogLevel = "error" | "warning" | "info" | "debug";

const logLevelStyles: Record<
  LogLevel,
  { icon: React.ReactNode; color: string }
> = {
  error: {
    icon: <AlertCircleIcon className="h-4 w-4" />,
    color: "bg-destructive/15 text-destructive border-destructive/20",
  },
  warning: {
    icon: <AlertTriangleIcon className="h-4 w-4" />,
    color: "bg-warning/15 text-warning border-warning/20",
  },
  info: {
    icon: <InfoIcon className="h-4 w-4" />,
    color: "bg-info/15 text-info border-info/20",
  },
  debug: {
    icon: <BugIcon className="h-4 w-4" />,
    color: "bg-muted/50 text-muted-foreground border-muted/20",
  },
};

// Log entry schema
const LogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  level: z.enum(["error", "warning", "info", "debug"]),
  message: z.string(),
  source: z.string(),
  details: z.record(z.string(), z.any()).optional(),
});

type LogEntry = z.infer<typeof LogEntrySchema>;

// Sample log data
const generateMockLogs = (): LogEntry[] => {
  const sources = [
    "app-service",
    "auth-service",
    "database",
    "file-service",
    "api-gateway",
  ];
  const messages = [
    "Application started successfully",
    "User authentication failed",
    "Database connection timeout",
    "API request received",
    "File upload completed",
    "Cache invalidated",
    "Background job executed",
    "Memory usage exceeded threshold",
    "External API request failed",
    "Configuration loaded",
  ];

  const logs: LogEntry[] = [];
  const now = new Date();

  // Generate 100 random log entries over the past 24 hours
  for (let i = 0; i < 100; i++) {
    const timeDiff = Math.floor(Math.random() * 24 * 60 * 60 * 1000);
    const timestamp = new Date(now.getTime() - timeDiff);
    const level =
      Math.random() > 0.9
        ? "error"
        : Math.random() > 0.8
          ? "warning"
          : Math.random() > 0.5
            ? "info"
            : "debug";
    const source = sources[Math.floor(Math.random() * sources.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    let details = {};
    if (level === "error") {
      details = {
        stack:
          "Error: Something went wrong\n    at processRequest (/app/server.js:42)\n    at handleAPI (/app/api/index.js:15)",
        code: "ERR_INTERNAL",
      };
    } else if (level === "warning") {
      details = { reason: "Resource usage high", threshold: "85%" };
    }

    logs.push({
      id: `log-${i}`,
      timestamp: timestamp.toISOString(),
      level: level as LogLevel,
      message,
      source,
      details: Object.keys(details).length > 0 ? details : undefined,
    });
  }

  // Sort logs by timestamp (newest first)
  return logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

const mockLogs = generateMockLogs();

export default function LogsPage() {
  // State
  const [logs, setLogs] = React.useState<LogEntry[]>(mockLogs);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedLevels, setSelectedLevels] = React.useState<LogLevel[]>([
    "error",
    "warning",
    "info",
    "debug",
  ]);
  const [selectedSource, setSelectedSource] = React.useState<string>("");
  const [timeRange, setTimeRange] = React.useState<string>("24h");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedLog, setSelectedLog] = React.useState<LogEntry | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Constants
  const pageSize = 20;
  const sources = Array.from(new Set(mockLogs.map((log) => log.source)));

  // Filter logs based on criteria
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      // Filter by log level
      if (!selectedLevels.includes(log.level)) return false;

      // Filter by source
      if (selectedSource && log.source !== selectedSource) return false;

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const messageMatch = log.message.toLowerCase().includes(searchLower);
        const sourceMatch = log.source.toLowerCase().includes(searchLower);
        const levelMatch = log.level.toLowerCase().includes(searchLower);
        if (!messageMatch && !sourceMatch && !levelMatch) return false;
      }

      // Filter by time range
      const logTime = new Date(log.timestamp).getTime();
      const now = new Date().getTime();

      switch (timeRange) {
        case "1h":
          return now - logTime <= 60 * 60 * 1000;
        case "6h":
          return now - logTime <= 6 * 60 * 60 * 1000;
        case "24h":
          return now - logTime <= 24 * 60 * 60 * 1000;
        case "7d":
          return now - logTime <= 7 * 24 * 60 * 60 * 1000;
        case "30d":
          return now - logTime <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
  }, [logs, selectedLevels, selectedSource, searchTerm, timeRange]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  // Handle log level toggle
  const toggleLogLevel = (level: LogLevel) => {
    if (selectedLevels.includes(level)) {
      // Don't allow removing the last selected level
      if (selectedLevels.length > 1) {
        setSelectedLevels(selectedLevels.filter((l) => l !== level));
      }
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  // Simulate log refresh
  const refreshLogs = () => {
    setIsRefreshing(true);
    // Simulate an API call delay
    setTimeout(() => {
      setLogs(generateMockLogs());
      setIsRefreshing(false);
      toast("Logs refreshed", {
        description: "The latest log entries have been loaded.",
      });
    }, 1000);
  };

  // Download logs as JSON
  const downloadLogs = () => {
    const logsJson = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([logsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${format(new Date(), "yyyy-MM-dd-HH-mm")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("Logs downloaded", {
      description: "Log data has been downloaded as JSON.",
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, "MMM d, yyyy HH:mm:ss");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">System Logs</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLogs}
            disabled={isRefreshing}
          >
            <RefreshCwIcon
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-lg">Log Entries</CardTitle>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Level:</span>
                {(Object.keys(logLevelStyles) as LogLevel[]).map((level) => (
                  <Badge
                    key={level}
                    variant="outline"
                    className={`flex items-center gap-1 cursor-pointer ${selectedLevels.includes(level) ? logLevelStyles[level].color : "opacity-40"}`}
                    onClick={() => toggleLogLevel(level)}
                  >
                    {logLevelStyles[level].icon}
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Badge>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[100px]">Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[120px]">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedLog(log)}
                      >
                        <TableCell className="font-mono text-xs">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`flex w-fit items-center gap-1 ${logLevelStyles[log.level].color}`}
                          >
                            {logLevelStyles[log.level].icon}
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {log.message}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50">
                            {log.source}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No log entries found matching the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + pageSize, filteredLogs.length)} of{" "}
                  {filteredLogs.length} entries
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
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
        </CardContent>
      </Card>

      {selectedLog && (
        <Card>
          <CardHeader className="py-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="text-lg">Log Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Timestamp</p>
                  <p className="font-mono text-sm">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Level</p>
                  <Badge
                    variant="outline"
                    className={`flex w-fit items-center gap-1 ${logLevelStyles[selectedLog.level].color}`}
                  >
                    {logLevelStyles[selectedLog.level].icon}
                    {selectedLog.level}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Source</p>
                  <Badge variant="outline" className="bg-muted/50">
                    {selectedLog.source}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Log ID</p>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Message</p>
                <p className="text-sm">{selectedLog.message}</p>
              </div>

              {selectedLog.details && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Details</p>
                  <div className="rounded-md bg-muted p-3">
                    <ScrollArea className="h-52">
                      <pre className="text-xs">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
