import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { routes } from "./lib/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { gcTime, staleTime } from "./lib/config";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No root element found");
}

const router = createBrowserRouter(routes);
// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: staleTime,
      // previously known as cacheTime
      gcTime: gcTime,
    },
  },
});

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
