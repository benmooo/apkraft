import {
  Package2,
  Layers,
  FileDown,
  ScrollText,
  Settings,
  LucideIcon,
} from "lucide-react";

export type RouteItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

export const navItems: RouteItem[] = [
  {
    title: "应用列表",
    url: "apps",
    icon: Package2,
  },
  {
    title: "版本管理",
    url: "app-versions",
    icon: Layers,
  },
  {
    title: "文件管理",
    url: "files",
    icon: FileDown,
  },
  {
    title: "日志",
    url: "logs",
    icon: ScrollText,
  },
];

export const withPrefix = (prefix: string) => (route: RouteItem) => ({
  ...route,
  url: `${prefix}/${route.url}`,
});
