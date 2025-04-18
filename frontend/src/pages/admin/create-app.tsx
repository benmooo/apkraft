"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import { ArrowLeftIcon } from "lucide-react";

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

// Create a schema for app creation that matches the Model in apps.rs
const createAppSchema = z.object({
  name: z.string().min(2, {
    message: "App name must be at least 2 characters.",
  }),
  bundle_id: z
    .string()
    .min(3, {
      message: "Bundle ID must be at least 3 characters.",
    })
    .regex(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/i, {
      message: "Please provide a valid bundle ID (e.g., com.apkraft.myapp)",
    }),
  description: z.string().optional(),
  icon_url: z.string().url({ message: "Please enter a valid URL" }).optional(),
  platform_id: z.number(),
});

type CreateAppFormValues = z.infer<typeof createAppSchema>;

// Default values for the form
const defaultValues: Partial<CreateAppFormValues> = {
  name: "",
  bundle_id: "",
  description: "",
  icon_url: "",
  platform_id: 1, // Default to Android
};

export default function CreateAppPage() {
  const navigate = useNavigate();

  // Initialize the form
  const form = useForm<CreateAppFormValues>({
    resolver: zodResolver(createAppSchema),
    defaultValues,
    mode: "onChange",
  });

  // Handle form submission
  function onSubmit(data: CreateAppFormValues) {
    // In a real app, you would send this data to your API
    console.log(data);

    // Show success toast
    toast("App created", {
      description: `Successfully created ${data.name}`,
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });

    // Navigate back to the apps list
    setTimeout(() => {
      navigate("/admin/apps");
    }, 1000);
  }

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

              <FormField
                control={form.control}
                name="icon_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/icon.png"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A URL pointing to the app's icon image (optional).
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

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/apps")}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">Create App</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
