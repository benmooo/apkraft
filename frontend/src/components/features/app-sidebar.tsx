import * as React from "react";
import { HelpCircleIcon, SearchIcon, SettingsIcon } from "lucide-react";

import { NavMain } from "@/components/features/nav/main";
import { NavSecondary } from "@/components/features/nav/secondary";
import { NavUser } from "@/components/features/nav/user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { adminPrefix, appName, palette } from "@/lib/config";
import { ApkraftLogo } from "../ui/apkraft-logo";
import { navItems, withPrefix } from "@/lib/nav-items";
import { useMatch } from "react-router";
import logo from "@/assets/apkraft_logo.png";

const withPrefixAdmin = withPrefix(adminPrefix);

const data = {
  user: {
    name: "Android",
    email: "android@admin.com",
    avatar: logo,
  },
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navMain = navItems.map(withPrefixAdmin).map((route) => ({
    title: route.title,
    url: route.url,
    icon: route.icon,
    isActive: Boolean(useMatch(route.url)),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ApkraftLogo color={palette.primary} />
                <span className="text-base font-semibold">{appName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
