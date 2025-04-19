import { z } from "zod";

export const AppSchema = z.object({
  id: z.number(),
  name: z.string(),
  bundle_id: z.string(),
  icon_file_id: z.number().nullable(),
  description: z.string().nullable(),
  platform_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type App = z.infer<typeof AppSchema>;

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

export type CreateAppFormValues = z.infer<typeof createAppSchema>;

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
