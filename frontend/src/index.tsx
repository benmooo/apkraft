import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { createBrowserRouter, RouterProvider } from "react-router";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import LandingPage from "./pages/landing-page";
import AdminLayout from "./components/layouts/admin-layout";
import Apps from "./pages/admin/apps";
import { adminPrefix } from "./lib/config";
import {
  RouterErrorBoundary,
  DefaultLoaderError,
} from "./components/features/router-error-boundary";
import Admin from "./pages/admin/admin";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No root element found");
}

let router = createBrowserRouter([
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
        path: "apps/create",
        Component: React.lazy(() => import("./pages/admin/create-app")),
      },
      {
        path: "app-versions",
        Component: React.lazy(() => import("./pages/admin/app-versions")),
      },
      {
        path: "app-versions/create",
        Component: React.lazy(() => import("./pages/admin/create-app-version")),
      },
      {
        path: "apk-files",
        Component: React.lazy(() => import("./pages/admin/apk-files")),
      },
      {
        path: "apk-files/create",
        Component: React.lazy(() => import("./pages/admin/create-apk")),
      },
      {
        path: "logs",
        Component: Apps,
      },
      {
        path: "settings",
        Component: Apps,
      },
    ],
  },
  // Catch-all route for 404 errors
  {
    path: "*",
    ErrorBoundary: RouterErrorBoundary,
  },
]);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
