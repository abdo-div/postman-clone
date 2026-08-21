import { z } from "zod";

export const importPostmanSchema = z.object({
  body: z.object({
    collectionId: z.string().optional().nullable(), // Optional root parent ID if importing into an existing folder
    postmanJson: z.object({
      info: z.object({
        name: z.string(),
        description: z.string().optional().default(""),
      }),
      variable: z
        .array(
          z.object({
            key: z.string(),
            value: z.string(),
          }),
        )
        .optional()
        .default([]),
      item: z.array(z.any()), // Postman items can be folders or requests
    }),
  }),
});

export type ImportPostmanInput = z.infer<typeof importPostmanSchema>["body"];
