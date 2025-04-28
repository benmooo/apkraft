import LandingPage from "@/pages/landing-page";
import AdminLayout from "@/components/layouts/admin-layout";
import Apps from "@/components/features/apps/apps-table";
import { adminPrefix } from "@/lib/config";
import { RouterErrorBoundary } from "@/components/features/router-error-boundary";
import Admin from "@/pages/admin/admin";
import React from "react";
import { RouteObject } from "react-router";

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: LandingPage,
    // Add error boundary to root route
    ErrorBoundary: RouterErrorBoundary,
  },
  {
    path: adminPrefix,
    Component: AdminLayout,
    // Add error boundary to admin layout route
    ErrorBoundary: RouterErrorBoundary,
    children: [
      {
        index: true,
        Component: Admin,
      },
      {
        path: "apps",
        Component: Apps,
      },
      {
        path: "apps/:id",
        Component: React.lazy(() => import("@/pages/admin/app-detail")),
      },
      {
        path: "apps/create",
        Component: React.lazy(() => import("@/pages/admin/create-app")),
      },
      {
        path: "app-versions",
        Component: React.lazy(() => import("@/pages/admin/app-versions")),
      },
      {
        path: "app-versions/:id",
        Component: React.lazy(() => import("@/pages/admin/app-version-detail")),
      },
      {
        path: "app-versions/create",
        Component: React.lazy(() => import("@/pages/admin/create-app-version")),
      },
      {
        path: "files",
        Component: React.lazy(() => import("@/pages/admin/files")),
      },
      {
        path: "files/create",
        Component: React.lazy(() => import("@/pages/admin/create-file")),
      },
      {
        path: "logs",
        Component: React.lazy(() => import("@/pages/admin/logs")),
      },
      {
        path: "settings",
        Component: React.lazy(() => import("@/pages/admin/settings")),
      },
    ],
  },
  // Catch-all route for 404 errors
  {
    path: "*",
    Component: React.lazy(() => import("@/pages/error/not-found")),
    ErrorBoundary: RouterErrorBoundary,
  },
];
