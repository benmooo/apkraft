import { z } from "zod";

export const AppSchema = z.object({
  id: z.number(),
  name: z.string(),
  bundle_id: z.string(),
  icon_url: z.string().nullable(),
  description: z.string().nullable(),
  platform_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type App = z.infer<typeof AppSchema>;
