import { z } from "zod";

export const appSchema = z.object({
  id: z.number(),
  name: z.string(),
  bundle_id: z.string(),
  icon_file_id: z.number().nullable(),
  description: z.string().nullable(),
  platform_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type App = z.infer<typeof appSchema>;

export const createAppSchema = z.object({
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
  icon_file_id: z.number(),
  platform_id: z.number(),
});

export type CreateApp = z.infer<typeof createAppSchema>;

export const FileSchema = z.object({
  created_at: z.string().datetime(), // ISO datetime string
  updated_at: z.string().datetime(),
  id: z.number().int(),
  name: z.string(),
  mime: z.string(),
  size_bytes: z.bigint(), // or z.number() if you plan to downcast
  path: z.string(),
  checksum_sha256: z.string(),
  description: z.string().nullable().optional(), // nullable = Some/None
});

// Inferred TypeScript type
export namespace Models {
  export type File = z.infer<typeof FileSchema>;
}

export type ApiResponse<T, I> = {
  code: number;
  data?: T;
  info?: I;
  error?: string;
};

export type PageMeta = {
  total_items: number;
  total_pages: number;
};

export type PagedResponse<T> = ApiResponse<Array<T>, PageMeta>;

export const createAppVersionSchema = z.object({
  app_id: z.number({
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
export type CreateAppVersion = z.infer<typeof createAppVersionSchema>;

// Schema for the AppVersion model
export const appVersionSchema = z.object({
  id: z.number(),
  version_code: z.string(),
  version_name: z.string(),
  release_notes: z.string().nullable(),
  published_at: z.string().nullable(),
  app_id: z.number(),
  apk_file_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AppVersion = z.infer<typeof appVersionSchema>;

// Pagination wrapper schema
export const PaginationSchema = z.object({
  pagination: z.object({
    total_items: z.number(),
    total_pages: z.number(),
    current_page: z.number(),
    page_size: z.number(),
  }),
  results: z.array(z.any()),
});
