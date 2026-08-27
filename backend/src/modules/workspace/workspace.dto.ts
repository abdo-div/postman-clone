import { z } from "zod";
import { WorkspaceRole } from "./workspace.model.js";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Workspace name must be at least 2 characters"),
    description: z.string().optional().default(""),
  }),
});

export const addMemberSchema = z.object({
  params: z.object({
    workspaceId: z.string({ message: "Workspace ID is required" }),
  }),
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
    role: z.nativeEnum(WorkspaceRole),
  }),
});
