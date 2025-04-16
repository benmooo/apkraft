import { AppSidebar } from "@/components/features/app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { SiteHeader } from "../features/site-header";
import { Outlet } from "react-router";
import { appName } from "@/lib/config";
import { TooltipProvider } from "../ui/tooltip";
import { Toaster } from "../ui/sonner";

export default function AdminLayout() {
  const title = appName;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />

        {/* add some padding */}
        <div className="p-4">
          <Outlet></Outlet>
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
