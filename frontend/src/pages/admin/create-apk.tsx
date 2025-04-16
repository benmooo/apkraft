"use client";

import * as React from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { ArrowLeftIcon, UploadIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// APK file upload validation schema
const apkUploadSchema = z.object({
  name: z.string().min(1, "Filename is required"),
  notes: z.string().optional(),
});

export default function CreateApkPage() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; notes?: string }>(
    {},
  );

  // File upload state
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Calculate filesize in human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    const units = ["KB", "MB", "GB"];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return size.toFixed(1) + " " + units[unitIndex];
  };

  // Mock checksum calculation (in a real app, this would be done server-side)
  const mockChecksum =
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile) {
      // Auto-populate name field with filename (minus the extension)
      const fileName = selectedFile.name.replace(/\.apk$/i, "");
      setName(fileName);
      setFile(selectedFile);
      setErrors({});
    }
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove the selected file
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Simulate file upload progress
  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 5;
      });
    }, 300);

    return () => clearInterval(interval);
  };

  // Form validation and submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: { name?: string; notes?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Filename is required";
    }

    if (!file) {
      toast("Error", {
        description: "Please select an APK file to upload",
      });
      return;
    }

    setErrors(newErrors);

    // If there are no errors, proceed with upload
    if (Object.keys(newErrors).length === 0) {
      // In a real app, you would upload the file to your server
      console.log("Uploading file:", file);
      console.log("Name:", name);
      console.log("Notes:", notes);

      // Simulate upload
      simulateUpload();

      // Show success toast after "upload" completes
      setTimeout(() => {
        toast("APK Uploaded", {
          description: `${file.name} has been uploaded successfully.`,
        });

        // Navigate back to the APK files list
        setTimeout(() => {
          navigate("/admin/apk-files");
        }, 1000);
      }, 5000); // After upload simulation completes
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate("/admin/apk-files")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Upload APK File</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>APK File Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apk-file">
                    APK File <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-2">
                    {!file ? (
                      <div
                        className="rounded-md border border-dashed p-6 text-center cursor-pointer hover:bg-muted/50"
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
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-md border bg-muted/30 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <UploadIcon className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Size:</span>
                            <span className="font-medium">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">
                              {file.type ||
                                "application/vnd.android.package-archive"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Modified:
                            </span>
                            <span className="font-medium">
                              {new Date(file.lastModified).toLocaleDateString()}
                            </span>
                          </div>
                          {uploadProgress === 100 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                SHA256:
                              </span>
                              <code className="bg-muted p-1 text-xs rounded">
                                {mockChecksum.substring(0, 8)}...
                                {mockChecksum.substring(
                                  mockChecksum.length - 8,
                                )}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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

                <div className="space-y-2">
                  <Label htmlFor="name">
                    File Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name for this APK file"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.name}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    This name will be used to identify the file in the system.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes about this APK file"
                    className="min-h-24"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add any additional information about this APK file
                    (optional).
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/apk-files")}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading || !file}>
                  {isUploading ? "Uploading..." : "Upload APK"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
