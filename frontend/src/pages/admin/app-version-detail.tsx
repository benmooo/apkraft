import * as React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  PackageIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  DownloadIcon,
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
import { AppVersion } from "@/schemas";
import { format } from "date-fns"; // For date formatting
import { downloadFile } from "@/lib/utils";

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

export const AppVersionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get ID from URL

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["app-version", id],
    queryFn: async () => {
      // Assume the API returns the AppVersion nested under 'data'
      const { data } = await client.get<AppVersion>(`/app-versions/${id}`);
      // TODO: The API should ideally include associated App details (name, bundle_id)
      // If not, a second query might be needed here based on response.data.app_id
      return data;
    },
    enabled: !!id, // Only run query if ID exists
  });

  const appVersion = response;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
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
          <XCircleIcon className="h-4 w-4" />
          <AlertTitle>Error Fetching App Version</AlertTitle>
          <AlertDescription>
            {error?.message || "An unknown error occurred."}
          </AlertDescription>
        </Alert>
      );
    }

    if (!appVersion) {
      return (
        <Alert>
          <PackageIcon className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The requested app version could not be found.
          </AlertDescription>
        </Alert>
      );
    }

    // TODO: Replace placeholders with actual data if App details are fetched/included
    const appName = `App ID: ${appVersion.app_id}`; // Placeholder
    const appBundleId = "N/A"; // Placeholder

    return (
      <div className="grid gap-6">
        {/* Card for Version Details */}
        <Card>
          <CardHeader>
            <CardTitle>Version Details</CardTitle>
            <CardDescription>
              Detailed information for version {appVersion.version_name}+
              {appVersion.version_code}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* TODO: Display App Name and Bundle ID properly */}
            <DetailItem
              label="App"
              value={
                <>
                  {appName} <Badge variant="outline">{appBundleId}</Badge>
                </>
              }
            />
            <Separator />
            <DetailItem label="Version Name" value={appVersion.version_name} />
            <DetailItem label="Version Code" value={appVersion.version_code} />
            <DetailItem
              label="Published"
              value={
                appVersion.published_at ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircleIcon className="mr-1 h-3 w-3" /> Published on{" "}
                    {format(new Date(appVersion.published_at), "PPpp")}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircleIcon className="mr-1 h-3 w-3" /> Not Published
                  </Badge>
                )
              }
            />
            <DetailItem
              label="Created At"
              value={format(new Date(appVersion.created_at), "PPpp")}
            />
            <DetailItem
              label="Last Updated"
              value={format(new Date(appVersion.updated_at), "PPpp")}
            />
            <Separator />
            <DetailItem label="APK File ID" value={appVersion.apk_file_id} />
            {/* You might add a download link here if the API supports it */}
            <Button onClick={() => downloadFile(appVersion.apk_file_id)}>
              <DownloadIcon /> Download APK
            </Button>
          </CardContent>
        </Card>

        {/* Card for Release Notes */}
        {appVersion.release_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Release Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md">
                {appVersion.release_notes}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons (Placeholder) */}
        <div className="flex space-x-4">
          {/* TODO: Add navigation/mutation logic for these buttons */}
          <Button variant="outline">
            <EditIcon className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive">
            <TrashIcon className="mr-2 h-4 w-4" /> Delete
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
            onClick={() => navigate(-1)} // Go back to previous page
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            App Version Details
          </h1>
        </div>
        {/* Maybe add a status badge here based on appVersion.published_at */}
      </div>
      {renderContent()}
    </div>
  );
};

// Export the component if it's not the default export already
export default AppVersionDetail;
