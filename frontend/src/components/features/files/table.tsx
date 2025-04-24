"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  PlusIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { useQuery } from "@tanstack/react-query";
import client from "@/lib/client";

import { usePagination } from "@/hooks/use-pagination";
import { Models, PagedResponse } from "@/schemas";
import { fileColumns } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyTableRow, ErrorTableRow, LoadingTableRow } from "../common";

export default function FilesTable() {
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState("");
  const [mimeFilter, setMimeFilter] = React.useState<string>("");

  const { pagination, onPaginationChange } = usePagination();
  const { pageIndex, pageSize } = pagination;

  const { data, isError, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["files", pageIndex, pageSize, searchTerm, mimeFilter],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: pageIndex + 1,
        page_size: pageSize,
      };

      if (searchTerm.trim()) {
        params.name = searchTerm.trim();
      }

      if (mimeFilter && mimeFilter !== "-") {
        params.mime = mimeFilter;
      }

      const response = await client.get("/files", { params });
      return response.data as PagedResponse<Models.File>;
    },
  });

  // Initialize table with TanStack React Table
  const table = useReactTable({
    data: data?.data ?? [],
    rowCount: data?.info?.total_items ?? 0,
    columns: fileColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const onPageSizeChange = (value: string) => {
    table.setPageSize(Number(value));
  };

  const handleRefetch = () => {
    refetch();
  };

  // Common MIME types for dropdown
  const commonMimeTypes = [
    { value: "-", label: "All Types" },
    { value: "application/pdf", label: "PDF" },
    { value: "application/vnd.android.package-archive", label: "APK" },
    { value: "image/jpeg", label: "JPEG" },
    { value: "image/png", label: "PNG" },
    { value: "application/zip", label: "ZIP" },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Files</h1>
        <Button onClick={() => navigate("/admin/files/create")} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload File
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
                  table.setPageIndex(0); // Reset to first page on search
                }}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-[220px]">
              <Select
                value={mimeFilter}
                onValueChange={(value) => {
                  setMimeFilter(value);
                  table.setPageIndex(0); // Reset to first page on filter change
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {commonMimeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              if (isLoading)
                return (
                  <LoadingTableRow
                    colSpan={fileColumns.length}
                  />
                );
              if (isError || data?.code !== 0)
                return (
                  <ErrorTableRow
                    colSpan={fileColumns.length}
                    onRetry={handleRefetch}
                    isRetrying={isRefetching}
                    message={error?.message}
                  />
                );

              if (!table.getRowModel().rows?.length)
                return (
                  <EmptyTableRow colSpan={fileColumns.length} />
                );

              return table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select value={`${pageSize}`} onValueChange={onPageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
