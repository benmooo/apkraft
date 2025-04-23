import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DownloadIcon,
  FileIcon,
  MoreVerticalIcon,
  CopyIcon,
  CheckIcon,
  BadgeInfoIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Models } from "@/schemas";
import { downloadFile } from "@/lib/utils";
import { defaultDateTimeFormat } from "@/lib/config";
import { useState } from "react";
import { toast } from "sonner";

// Helper function to format file size
const formatFileSize = (bytes: bigint): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === BigInt(0)) return "0 Byte";
  const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024));
  return `${(Number(bytes) / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Format SHA256 checksum for display
const formatChecksum = (checksum: string) => {
  return `${checksum.substring(0, 8)}...${checksum.substring(checksum.length - 8)}`;
};

// Define columns for the data table
export const fileColumns: ColumnDef<Models.File>[] = [
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
    id: "name",
    header: "File Name",
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div className="flex items-center space-x-3">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="font-medium">{file.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-xs">
              {file.path}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "size",
    header: () => <div className="text-right">Size</div>,
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div className="text-right">
          <span className="font-mono">{formatFileSize(file.size_bytes)}</span>
        </div>
      );
    },
  },
  {
    id: "checksum",
    header: "SHA256 Checksum",
    cell: ({ row }) => {
      const file = row.original;
      const [copied, setCopied] = useState(false);

      const copyToClipboard = () => {
        navigator.clipboard
          .writeText(file.checksum_sha256)
          .then(() => {
            setCopied(true);
            toast("Copied", {
              description: "Checksum copied to clipboard",
            });
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => {
            console.error("Could not copy text: ", err);
          });
      };

      return (
        <div className="flex items-center gap-2">
          <code className="bg-muted p-1 text-xs rounded">
            {formatChecksum(file.checksum_sha256)}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={copyToClipboard}
          >
            {copied ? (
              <CheckIcon className="h-3 w-3 text-green-500" />
            ) : (
              <CopyIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    id: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const file = row.original;
      return format(new Date(file.created_at), defaultDateTimeFormat);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const file = row.original;
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
              onClick={() => navigate(`/admin/files/${file.id}`)}
            >
              <BadgeInfoIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadFile(file.id)}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
