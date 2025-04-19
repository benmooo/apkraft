"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { ArrowLeftIcon, LoaderIcon, PlusIcon, SendIcon, UploadIcon } from "lucide-react";

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
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { App, CreateAppFormValues, createAppSchema } from "@/schemas";
import React, { useEffect } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import client from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/index";

// Create a schema for app creation that matches the Model in apps.rs

// Default values for the form
const defaultValues: Partial<CreateAppFormValues> = {
  name: "",
  bundle_id: "",
  description: "",
  platform_id: 1, // Default to Android
};

export default function CreateAppPage() {
  const navigate = useNavigate();

  const [file, setFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { uploading, progress, uploadFile, data, error } = useFileUpload();

  // Initialize the form
  const form = useForm<CreateAppFormValues>({
    resolver: zodResolver(createAppSchema),
    defaultValues,
    mode: "onChange",
  });

  const createApp = async (app: CreateAppFormValues) => {
    const { data } = await client.post("/apps", app);
    return data as App;
  };

  const mutation = useMutation({
    mutationFn: createApp,
    onSuccess(data) {
      toast("App created", {
        description: `Successfully created ${data.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      navigate(-1);
    },
    onError(error) {
      toast("Error creating app", {
        description: error.message,
      });
    },
  });

  // Handle form submission
  function onSubmit(data: CreateAppFormValues) {
    mutation.mutate(data);
  }

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      uploadFile(selectedFile);
    }
  };

  useEffect(() => {
    if (data) {
      // update form data
      form.setValue("icon_file_id", data.id);
    }
  }, [data]);

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate("/admin/apps")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New App</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>App Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome App" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your application as it will appear to users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bundle_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="com.apkraft.myapp" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for your app (e.g.,
                      com.apkraft.myapp).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform *</FormLabel>
                    <Select
                      disabled
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Android</SelectItem>
                        <SelectItem value="2">iOS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The platform this app is built for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div>
                  <FormLabel htmlFor="icon-file">Icon File</FormLabel>
                  <div className="mt-2">
                    <div
                      className={`rounded-md border border-dashed p-6 text-center cursor-pointer hover:bg-muted/50 ${file ? "border-primary/50 bg-primary/5" : ""}`}
                      onClick={handleUploadClick}
                    >
                      <input
                        id="icon-file"
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".png"
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
                              image files only (*.png, *.jpg, *.jpeg, *.svg)
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
                        <span>{progress ?? 0}%</span>
                      </div>
                      <Progress value={progress ?? 0} />
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="icon_file_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon File ID *</FormLabel>
                    <FormControl>
                      <Input disabled {...field} value={data?.id || ""} />
                    </FormControl>
                    <FormDescription>
                      A Icon File ID that automatically generated when file icon
                      is uploaded.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description of your app"
                        className="min-h-32"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of your app (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Publish Immediately
                  </FormLabel>
                  <FormDescription>
                    Make this version available as soon as it's uploaded.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={false} />
                </FormControl>
              </FormItem>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/apps")}
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
                  {mutation.isPending ? "Creating..." : "Create App"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
