import { z } from "zod";

export const enqueueCollectionRunSchema = z.object({
  body: z.object({
    collectionId: z.string({ message: "Collection ID is required" }),
    environmentId: z.string().optional(),
    workspaceId: z.string({ message: "Workspace ID is required" }),
  }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    jobId: z.string({ message: "Job ID is required" }),
  }),
});
