import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DownloadIcon, ExternalLinkIcon, MoreVerticalIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { AppVersion } from "@/schemas";
import { formatFileSize } from "@/lib/utils";

// Define columns for the data table
export const appVersionColumns: ColumnDef<AppVersion>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "version",
    header: "Version",
    cell: ({ row }) => {
      const version = row.original;
      return (
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
      );
    },
  },
  {
    id: "app_id",
    header: "App ID",
    cell: ({ row }) => {
      const version = row.original;
      return (
        <div>
          <div className="font-medium">{version.app_id}</div>
        </div>
      );
    },
  },
  {
    id: "publishedAt",
    header: "Published",
    cell: ({ row }) => {
      const version = row.original;
      return version.published_at ? (
        format(new Date(version.published_at), "MMM dd, yyyy")
      ) : (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800/30"
        >
          Draft
        </Badge>
      );
    },
  },
  {
    id: "apk_file_id",
    header: () => <div className="text-right"></div>,
    cell: ({ row }) => {
      const version = row.original;
      return (
        <div className="text-right">
          <span className="font-mono">{formatFileSize(version.apk_file_id)}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const version = row.original;
      const navigate = useNavigate();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
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
      );
    },
  },
];
