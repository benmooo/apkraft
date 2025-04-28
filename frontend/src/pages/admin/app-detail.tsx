import * as React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  PackageIcon,
  EditIcon,
  TrashIcon,
  CircleIcon,
} from "lucide-react"; // Added icons

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator"; // Added Separator
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton for loading
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert for errors
import client from "@/lib/client";
import { App } from "@/schemas"; // Assuming App schema exists
import { format } from "date-fns"; // For date formatting

// Helper component to display details cleanly
const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-3 gap-2 items-start">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <div className="col-span-2 text-sm">{value}</div>
  </div>
);

export const AppDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get App ID from URL

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["app", id],
    queryFn: async () => {
      // Fetch app details from the API
      const { data } = await client.get<App>(`/apps/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if ID exists
  });

  const app = response;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <CircleIcon className="h-4 w-4" />
          <AlertTitle>Error Fetching App Details</AlertTitle>
          <AlertDescription>
            {error?.message || "An unknown error occurred."}
          </AlertDescription>
        </Alert>
      );
    }

    if (!app) {
      return (
        <Alert>
          <PackageIcon className="h-4 w-4" />
          <AlertTitle>App Not Found</AlertTitle>
          <AlertDescription>
            The requested app could not be found.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid gap-6">
        {/* Card for App Details */}
        <Card>
          <CardHeader>
            <CardTitle>{app.name}</CardTitle>
            <CardDescription>
              Details for the app with bundle ID:{" "}
              <Badge variant="outline">{app.bundle_id}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="App ID" value={app.id} />
            <DetailItem label="Name" value={app.name} />
            <DetailItem label="Bundle ID" value={app.bundle_id} />
            <Separator />
            <DetailItem
              label="Created At"
              value={format(new Date(app.created_at), "PPpp")}
            />
            <DetailItem
              label="Last Updated"
              value={format(new Date(app.updated_at), "PPpp")}
            />
          </CardContent>
        </Card>

        {/* Card for Description (if available) */}
        {app.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{app.description}</p>
            </CardContent>
          </Card>
        )}

        {/* TODO: Add a section or card to list associated App Versions */}
        {/* For example: */}
        {/* <Card>
          <CardHeader>
             <CardTitle>App Versions</CardTitle>
          </CardHeader>
          <CardContent>
             <p>List of versions for this app would go here.</p>
             <Button variant="outline" className="mt-4" onClick={() => navigate(`/admin/app-versions?app_id=${app.id}`)}>
                 <ListIcon className="mr-2 h-4 w-4" /> View All Versions
             </Button>
          </CardContent>
        </Card> */}

        {/* Action Buttons (Placeholder) */}
        <div className="flex justify-end space-x-4">
          {/* TODO: Add navigation/mutation logic for these buttons */}
          <Button variant="outline">
            <EditIcon className="mr-2 h-4 w-4" /> Edit App
          </Button>
          <Button variant="destructive">
            <TrashIcon className="mr-2 h-4 w-4" /> Delete App
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)} // Go back to the apps list page
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">App Details</h1>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

// Export the component
// If you're using React.lazy with a default import in your router config:
export default AppDetail;
