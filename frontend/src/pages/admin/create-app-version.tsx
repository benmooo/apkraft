import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { ArrowLeftIcon, LoaderIcon, PlusIcon, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ApiResponse,
  App,
  AppVersion,
  CreateAppVersion,
  createAppVersionSchema,
  PagedResponse,
} from "@/schemas";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePagination } from "@/hooks/use-pagination";
import client from "@/lib/client";
import LoadingSpinner from "@/components/loading-spinner";
import { useFileUpload } from "@/hooks/use-file-upload";
import { queryClient } from "@/index";
import { useEffect } from "react";

// Default values
const defaultValues: Partial<CreateAppVersion> = {
  version_code: "",
  version_name: "",
  release_notes: "",
  publish_immediately: false,
};

export default function CreateAppVersionPage() {
  const navigate = useNavigate();

  // State for file upload
  const [file, setFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const {
    uploading,
    progress,
    uploadFile,
    data: uploadResponse,
    error: _uploadError,
  } = useFileUpload();

  const { pagination, onPaginationChange: _ } = usePagination(1000);
  const { pageIndex, pageSize } = pagination;

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["apps", pageIndex, pageSize],
    queryFn: async () =>
      (
        await client.get("/apps", {
          params: { page: pageIndex + 1, page_size: pageSize },
        })
      ).data as PagedResponse<App>,
  });

  // Initialize the form
  const form = useForm<CreateAppVersion>({
    resolver: zodResolver(createAppVersionSchema),
    defaultValues,
    mode: "onChange",
  });

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      uploadFile(selectedFile);
    }
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (uploadResponse) {
      form.setValue("apk_file_id", uploadResponse.id);
      form.trigger("apk_file_id");
    }
  }, [uploadResponse]);

  const createAppVersion = async (app: CreateAppVersion) => {
    const { data } = await client.post("/app-versions", app);
    return data as ApiResponse<AppVersion, undefined>;
  };

  const mutation = useMutation({
    mutationFn: createAppVersion,
    onSuccess(data) {
      toast("App created", {
        description: `Successfully created ${data.data?.version_name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["app-versions"] });
      navigate(-1);
    },
    onError(error) {
      toast("Error creating app version", {
        description: error.message,
      });
    },
  });

  // Handle form submission
  function onSubmit(data: CreateAppVersion) {
    mutation.mutate(data);
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Version</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Version Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="app_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select App</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an app" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(() => {
                            if (isError)
                              return (
                                <SelectItem value="error" disabled>
                                  {error?.toString()}
                                </SelectItem>
                              );
                            if (isLoading) return <LoadingSpinner />;

                            return data?.data?.map((app) => (
                              <SelectItem
                                key={app.id}
                                value={app.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  {app.name}
                                  <Badge variant="outline" className="text-xs">
                                    {app.bundle_id}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the app this version belongs to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="version_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version Code</FormLabel>
                        <FormControl>
                          <Input placeholder="100" {...field} />
                        </FormControl>
                        <FormDescription>
                          Integer value that increases with each version (e.g.,
                          100, 101, 102).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="version_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version Name</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Human-readable version string (e.g., 1.0.0,
                          2.1.3-beta).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="release_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What's new in this version?"
                          className="min-h-32"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the changes in this version (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <FormLabel htmlFor="apk-file">APK File</FormLabel>
                    <div className="mt-2">
                      <div
                        className={`rounded-md border border-dashed p-6 text-center cursor-pointer hover:bg-muted/50 ${file ? "border-primary/50 bg-primary/5" : ""}`}
                        onClick={handleUploadClick}
                      >
                        <input
                          id="apk-file"
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept=".apk"
                          onChange={handleFileChange}
                        />
                        <UploadIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                        <div className="mt-2">
                          {file ? (
                            <div>
                              <p className="font-medium text-primary">
                                {file.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          ) : (
                            <p>
                              <span className="font-medium text-primary">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                              <br />
                              <span className="text-sm text-muted-foreground">
                                APK files only (*.apk)
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {uploading && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="publish_immediately"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publish Immediately
                          </FormLabel>
                          <FormDescription>
                            Make this version available as soon as it's
                            uploaded.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin/app-versions")}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {!mutation.isPending ? (
                      <PlusIcon />
                    ) : (
                      <LoaderIcon className="animate-spin" />
                    )}
                    {mutation.isPending ? "Creating..." : "Create App Version"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
