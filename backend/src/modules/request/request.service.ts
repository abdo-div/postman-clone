import { RequestModel, IRequest } from "./request.model.js";
import { CollectionModel } from "../collection/collection.model.js";
import { CreateRequestInput, UpdateRequestInput } from "./request.dto.js";
import { NotFoundError } from "../../errors/app-error.js";

function formatHeaders(headersRaw: any): any[] {
  if (!headersRaw) return [];
  if (Array.isArray(headersRaw)) return headersRaw;
  if (headersRaw instanceof Map || typeof headersRaw === "object") {
    const entries = headersRaw instanceof Map ? Array.from(headersRaw.entries()) : Object.entries(headersRaw);
    return entries.map(([key, value], idx) => ({
      id: `h-${idx + 1}`,
      enabled: true,
      key,
      value: String(value),
    }));
  }
  return [];
}

function formatQueryParams(paramsRaw: any): any[] {
  if (!paramsRaw) return [];
  if (Array.isArray(paramsRaw)) return paramsRaw;
  if (paramsRaw instanceof Map || typeof paramsRaw === "object") {
    const entries = paramsRaw instanceof Map ? Array.from(paramsRaw.entries()) : Object.entries(paramsRaw);
    return entries.map(([key, value], idx) => ({
      id: `p-${idx + 1}`,
      enabled: true,
      key,
      value: String(value),
    }));
  }
  return [];
}

function toResponseObject(r: any): any {
  if (!r) return r;
  const raw = typeof r.toObject === "function" ? r.toObject() : r;
  return {
    ...raw,
    id: raw._id ? raw._id.toString() : raw.id,
    name: raw.name,
    collectionId: raw.collectionId ? raw.collectionId.toString() : undefined,
    workspaceId: raw.workspaceId ? raw.workspaceId.toString() : undefined,
    method: raw.method,
    url: raw.url,
    headers: formatHeaders(raw.headers),
    queryParams: formatQueryParams(raw.queryParams),
    bodyType: raw.body?.mode || "none",
    body: raw.body?.rawContent || "",
    testsScript: raw.testScript || "",
    preRequestScript: raw.preRequestScript || "",
  };
}

export class RequestService {
  public async createRequest(input: CreateRequestInput): Promise<any> {
    const collectionExists = await CollectionModel.findById(input.collectionId);
    if (!collectionExists) {
      throw new NotFoundError(`Parent Collection with ID ${input.collectionId} not found`);
    }

    const created = await RequestModel.create(input as unknown as Partial<IRequest>);
    return toResponseObject(created);
  }

  public async getRequestsByCollection(collectionId: string): Promise<any[]> {
    const requests = await RequestModel.find({ collectionId }).lean();
    if (!Array.isArray(requests)) return [];
    return requests.map(toResponseObject);
  }

  public async getRequestById(id: string): Promise<any> {
    const requestItem = await RequestModel.findById(id);
    if (!requestItem) {
      throw new NotFoundError(`Request with ID ${id} not found`);
    }
    return toResponseObject(requestItem);
  }

  public async updateRequest(id: string, input: UpdateRequestInput): Promise<any> {
    const updated = await RequestModel.findByIdAndUpdate(
      id,
      input as unknown as Partial<IRequest>,
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new NotFoundError(`Request with ID ${id} not found`);
    }
    return toResponseObject(updated);
  }

  public async deleteRequest(id: string): Promise<void> {
    const deleted = await RequestModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Request with ID ${id} not found`);
    }
  }
}