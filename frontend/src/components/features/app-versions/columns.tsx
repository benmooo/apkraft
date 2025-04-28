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
import {
  DownloadIcon,
  EditIcon,
  ExternalLinkIcon,
  InfoIcon,
  MoreVerticalIcon,
  Trash2Icon,
  Unlink,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { AppVersion } from "@/schemas";
import { downloadFile } from "@/lib/utils";
import { useDeleteAppVersion } from "@/hooks/use-delete-app-version";
import { usePublishAppVersion } from "@/hooks/use-publish-app-version";
import LoadingSpinner from "@/components/loading-spinner";
import { defaultDateTimeFormat } from "@/lib/config";

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
        format(new Date(version.published_at), defaultDateTimeFormat)
      ) : (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800/30"
        >
          Candidate
        </Badge>
      );
    },
  },
  {
    id: "releaseNotes",
    header: "Release Notes",
    cell: ({ row }) => {
      const version = row.original;
      return (
        <div className="text-sm text-muted-foreground text-wrap max-w-md">
          {version.release_notes || "No release notes"}
        </div>
      );
    },
  },

  {
    id: "apk_file_id",
    header: () => <div className="text-right">APK File ID</div>,
    cell: ({ row }) => {
      const version = row.original;
      return (
        <div className="text-right">
          <span className="font-mono">{version.apk_file_id}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const version = row.original;
      const navigate = useNavigate();

      const deleteAppVersion = useDeleteAppVersion(version.id);
      const onDelete = () => {
        deleteAppVersion.mutate();
      };

      const published = Boolean(version.published_at);
      const publishAppVersion = usePublishAppVersion(version.id, !published);

      const onPublish = () => {
        publishAppVersion.mutate();
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              {deleteAppVersion.isPending || publishAppVersion.isPending ? (
                <LoadingSpinner />
              ) : (
                <MoreVerticalIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link to={`/admin/app-versions/${version.id}`}>
              <DropdownMenuItem>
                <InfoIcon></InfoIcon>
                View Details
              </DropdownMenuItem>
            </Link>

            <Link to={`/admin/app-versions/${version.id}/edit`}>
              <DropdownMenuItem>
                <EditIcon></EditIcon>
                Edit
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem onClick={() => downloadFile(version.apk_file_id)}>
              <DownloadIcon />
              Download APK
            </DropdownMenuItem>
            {
              <DropdownMenuItem onClick={onPublish}>
                {version.published_at ? <Unlink /> : <ExternalLinkIcon />}
                {version.published_at ? "Unpublish" : "Publish"}
              </DropdownMenuItem>
            }
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2Icon className="text-destructive"></Trash2Icon>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
