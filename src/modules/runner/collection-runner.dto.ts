import { z } from "zod";

export const runCollectionSchema = z.object({
  body: z.object({
    collectionId: z.string({ message: "Collection ID is required" }),
    environmentId: z.string().optional(),
    stopOnError: z.boolean().optional().default(false),
  }),
});

export type RunCollectionInput = z.infer<typeof runCollectionSchema>["body"];
