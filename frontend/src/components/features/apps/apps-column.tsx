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
import { App } from "@/schemas";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreVerticalIcon } from "lucide-react";
import { Link } from "react-router";

// Define columns for the data table
export const appColumns: ColumnDef<App>[] = [
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
    accessorKey: "name",
    header: "App Name",
    cell: ({ row }) => {
      const app = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-md bg-muted overflow-hidden">
            {false ? (
              <img
                src={`app.icon_file_id`}
                alt={app.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-xs text-muted-foreground font-medium">
                No Icon
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{app.name}</div>
            <div className="text-xs text-muted-foreground">{app.bundle_id}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        description || (
          <span className="text-muted-foreground text-sm">No description</span>
        )
      );
    },
  },
  {
    accessorKey: "platform_id",
    header: "Platform",
    cell: ({ row }) => {
      const platformId = row.original.platform_id;
      const platformName = platformId === 1 ? "Android" : "iOS";
      return (
        <Badge variant="outline" className="px-2">
          {platformName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      return format(new Date(row.original.created_at), "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
    cell: ({ row }) => {
      return format(new Date(row.original.updated_at), "MMM dd, yyyy");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const app = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              size="icon"
            >
              <MoreVerticalIcon className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <Link to={`/admin/apps/${app.id}`}>
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </Link>

            <Link to={`/admin/apps/${app.id}/edit`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                // Implement delete functionality
                console.log(`Delete app ${app.id}`);
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
