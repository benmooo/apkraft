import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { ArrowLeftIcon, UploadIcon } from "lucide-react";

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

// Create a schema for app version creation that matches app_versions.rs
const createAppVersionSchema = z.object({
  app_id: z.string({
    required_error: "Please select an app",
  }),
  version_code: z
    .string()
    .min(1, {
      message: "Version code is required",
    })
    .regex(/^\d+$/, {
      message: "Version code must be a number",
    }),
  version_name: z
    .string()
    .min(1, {
      message: "Version name is required",
    })
    .regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/, {
      message: "Please use semantic versioning (e.g., 1.0.0 or 1.0.0-beta.1)",
    }),
  release_notes: z.string().optional(),
  publish_immediately: z.boolean(),
});

// Create the form type using infer
type CreateAppVersionFormValues = z.infer<typeof createAppVersionSchema>;

// Default values
const defaultValues: Partial<CreateAppVersionFormValues> = {
  app_id: "",
  version_code: "",
  version_name: "",
  release_notes: "",
  publish_immediately: false,
};

// Mock apps for selection
const mockApps = [
  { id: "1", name: "APKraft Manager", bundle_id: "com.apkraft.manager" },
  { id: "2", name: "APKraft Dashboard", bundle_id: "com.apkraft.dashboard" },
  { id: "3", name: "APKraft Mobile", bundle_id: "com.apkraft.mobile" },
];

export default function CreateAppVersionPage() {
  const navigate = useNavigate();

  // State for file upload
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize the form
  const form = useForm<CreateAppVersionFormValues>({
    resolver: zodResolver(createAppVersionSchema),
    defaultValues,
    mode: "onChange",
  });

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Simulate file upload progress
  const simulateUpload = () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  };

  // Handle form submission
  function onSubmit(data: CreateAppVersionFormValues) {
    if (!file) {
      toast("Error", {
        description: "Please upload an APK file",
      });
      return;
    }

    // In a real app, you would send the form data and file to your API
    console.log("Form data:", data);
    console.log("File:", file);

    // Simulate file upload
    simulateUpload();

    // Show success toast after "upload" completes
    setTimeout(() => {
      toast("Version created", {
        description: `Version ${data.version_name} created successfully${data.publish_immediately ? " and published" : ""}.`,
      });

      // Navigate back to the versions list
      setTimeout(() => {
        navigate("/admin/app-versions");
      }, 1000);
    }, 5500); // After upload simulation completes
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate("/admin/app-versions")}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an app" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockApps.map((app) => (
                            <SelectItem key={app.id} value={app.id}>
                              <div className="flex items-center gap-2">
                                {app.name}
                                <Badge variant="outline" className="text-xs">
                                  {app.bundle_id}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
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

                    {isUploading && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
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
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Create Version"}
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
