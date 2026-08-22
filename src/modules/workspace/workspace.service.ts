import {
  WorkspaceModel,
  WorkspaceRole,
  IWorkspace,
} from "./workspace.model.js";
import { NotFoundError } from "../../errors/app-error.js";
import { Types } from "mongoose";

export class WorkspaceService {
  public async createWorkspace(
    ownerId: string,
    name: string,
    description?: string,
  ): Promise<IWorkspace> {
    const ownerObjectId = new Types.ObjectId(ownerId);

    const workspace = await WorkspaceModel.create({
      name,
      description: description || "",
      ownerId: ownerObjectId,
      members: [
        {
          userId: ownerObjectId,
          role: WorkspaceRole.OWNER,
        },
      ],
    });

    return workspace;
  }

  public async getUserWorkspaces(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    return WorkspaceModel.find({
      $or: [{ ownerId: userObjectId }, { "members.userId": userObjectId }],
    }).lean();
  }

  public async addMember(
    workspaceId: string,
    targetUserId: string,
    role: WorkspaceRole,
  ) {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const targetObjectId = new Types.ObjectId(targetUserId);

    // Check if user is already in workspace
    const existingMember = workspace.members.find(
      (m) => m.userId.toString() === targetUserId,
    );

    if (existingMember) {
      existingMember.role = role;
    } else {
      workspace.members.push({ userId: targetObjectId, role });
    }

    await workspace.save();
    return workspace;
  }
}
