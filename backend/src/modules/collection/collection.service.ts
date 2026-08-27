import mongoose from "mongoose";
import { CollectionModel, ICollection } from "./collection.model.js";
import { RequestModel } from "../request/request.model.js";
import { CreateCollectionInput, UpdateCollectionInput } from "./collection.dto.js";
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

export class CollectionService {
  public async seedDefaultCollectionsIfEmpty(): Promise<void> {
    if (process.env.NODE_ENV === "test" || mongoose.connection.readyState !== 1) return;
    try {
      const count = await CollectionModel.countDocuments();
      if (count > 0) return;

      const userCol = await CollectionModel.create({
        name: "User Authentication & Profiles",
        description: "Endpoints for signup, token verification, and user management",
      });

      await RequestModel.create([
        {
          collectionId: userCol._id,
          name: "List Users",
          method: "GET",
          url: "https://jsonplaceholder.typicode.com/users",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          queryParams: { "_limit": "10" },
          body: { mode: "none" },
          testScript: `pm.test("Status code is 200", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test("Response is an array with users", function () {\n    const data = pm.response.json();\n    pm.expect(data).to.be.a("array");\n    pm.expect(data.length).to.be.above(0);\n});\n\npm.test("Response time is under 800ms", function () {\n    pm.expect(pm.response.responseTime).to.be.below(800);\n});`,
        },
        {
          collectionId: userCol._id,
          name: "Get User By ID",
          method: "GET",
          url: "https://jsonplaceholder.typicode.com/users/1",
          headers: { "Accept": "application/json" },
          queryParams: {},
          body: { mode: "none" },
          testScript: `pm.test("Status code is 200", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test("User has name and email", function () {\n    const data = pm.response.json();\n    pm.expect(data).to.have.property("name");\n    pm.expect(data).to.have.property("email");\n});`,
        },
        {
          collectionId: userCol._id,
          name: "Create User Post",
          method: "POST",
          url: "https://jsonplaceholder.typicode.com/posts",
          headers: { "Content-Type": "application/json" },
          queryParams: {},
          body: {
            mode: "json",
            rawContent: JSON.stringify({
              title: "Dynamic API Architecture",
              body: "Testing seamless request execution with test suites.",
              userId: 1,
            }, null, 2),
          },
          testScript: `pm.test("Status is 201 Created", function () {\n    pm.response.to.have.status(201);\n});\n\npm.test("Post ID is returned", function () {\n    const data = pm.response.json();\n    pm.expect(data).to.have.property("id");\n});`,
        },
      ]);

      const paymentCol = await CollectionModel.create({
        name: "Payment & Checkout API",
        description: "Payment gateway integration, webhooks, and invoice generation",
      });

      await RequestModel.create([
        {
          collectionId: paymentCol._id,
          name: "Health Check",
          method: "GET",
          url: "https://jsonplaceholder.typicode.com/todos/1",
          headers: {},
          queryParams: {},
          body: { mode: "none" },
          testScript: `pm.test("Status is 200", function () {\n    pm.response.to.have.status(200);\n});`,
        },
      ]);
    } catch {
      // ignore
    }
  }

  public async createCollection(input: CreateCollectionInput): Promise<ICollection> {
    return await CollectionModel.create(input as unknown as Partial<ICollection>);
  }

  public async getAllCollections(): Promise<any[]> {
    await this.seedDefaultCollectionsIfEmpty();

    const collections = await CollectionModel.find({ parentId: null }).lean();
    if (!Array.isArray(collections)) return [];

    let requests: any[] = [];
    if (process.env.NODE_ENV !== "test" && mongoose.connection.readyState === 1) {
      try {
        const colIds = collections.map((c: any) => c._id);
        requests = await RequestModel.find({ collectionId: { $in: colIds } }).lean();
      } catch {
        requests = [];
      }
    }

    return collections.map((c: any) => {
      const colReqs = requests
        .filter((r) => r.collectionId && r.collectionId.toString() === (c._id ? c._id.toString() : ""))
        .map((r) => ({
          id: r._id.toString(),
          name: r.name,
          collectionId: c._id ? c._id.toString() : "",
          method: r.method,
          url: r.url,
          headers: formatHeaders(r.headers),
          queryParams: formatQueryParams(r.queryParams),
          bodyType: r.body?.mode || "none",
          body: r.body?.rawContent || "",
          testsScript: r.testScript || "",
          preRequestScript: r.preRequestScript || "",
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));

      return {
        ...c,
        id: c._id ? c._id.toString() : c.id,
        requests: colReqs.length > 0 ? colReqs : c.requests || [],
        folders: c.folders || [],
      };
    });
  }

  public async getCollectionById(id: string): Promise<any> {
    const collection = await CollectionModel.findById(id);
    if (!collection) {
      throw new NotFoundError(`Collection with ID ${id} not found`);
    }
    return collection;
  }

  public async updateCollection(id: string, input: UpdateCollectionInput): Promise<any> {
    const updated = await CollectionModel.findByIdAndUpdate(id, input, { new: true });
    if (!updated) {
      throw new NotFoundError(`Collection with ID ${id} not found`);
    }
    return updated;
  }

  public async deleteCollection(id: string): Promise<void> {
    const collection = await CollectionModel.findById(id);
    if (!collection) {
      throw new NotFoundError(`Collection with ID ${id} not found`);
    }
    if (process.env.NODE_ENV !== "test" && mongoose.connection.readyState === 1) {
      try {
        await RequestModel.deleteMany({ collectionId: id });
      } catch {
        // ignore
      }
    }
    await collection.deleteOne();
  }
}