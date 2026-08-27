import { z } from "zod";

export const importOpenApiSchema = z.object({
  body: z.object({
    collectionId: z.string().optional().nullable(),
    spec: z.object({
      openapi: z.string().refine((val) => val.startsWith("3."), {
        message: "Only OpenAPI 3.x specifications are supported",
      }),
      info: z.object({
        title: z.string(),
        description: z.string().optional().default(""),
      }),
      servers: z
        .array(
          z.object({
            url: z.string(),
          }),
        )
        .optional()
        .default([]),
      paths: z.record(z.string(), z.any()),
    }),
  }),
});

export type ImportOpenApiInput = z.infer<typeof importOpenApiSchema>["body"];
