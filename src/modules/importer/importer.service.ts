import {
  CollectionModel,
  ICollection,
} from "../collection/collection.model.js";
import { RequestModel } from "../request/request.model.js";
import { ImportPostmanInput } from "./importer.dto.js";
import { Types } from "mongoose";
import { ImportOpenApiInput } from "./openapi.dto.js";

export class ImporterService {
  public async importPostmanCollection(input: ImportPostmanInput) {
    const { postmanJson, collectionId } = input;
    const rootParentId = collectionId ? new Types.ObjectId(collectionId) : null;

    // 1. Extract collection-level variables into a Map
    const variablesMap = new Map<string, string>();
    if (postmanJson.variable) {
      for (const v of postmanJson.variable) {
        if (v.key) {
          variablesMap.set(v.key, String(v.value || ""));
        }
      }
    }

    // 2. Explicitly type rootCollection as ICollection
    const rootCollection: ICollection = await CollectionModel.create({
      name: postmanJson.info.name,
      description: postmanJson.info.description || "",
      parentId: rootParentId,
      variables: variablesMap,
    } as unknown as Partial<ICollection>);

    // 3. Recursively parse items (folders and requests)
    await this.parseItems(
      postmanJson.item,
      rootCollection._id as Types.ObjectId,
    );

    return {
      success: true,
      importedCollectionId: rootCollection._id,
      name: rootCollection.name,
    };
  }

  private async parseItems(
    items: Array<any>,
    parentCollectionId: Types.ObjectId,
  ) {
    for (const item of items) {
      if (item.item && Array.isArray(item.item)) {
        // Explicitly type subCollection as ICollection
        const subCollection: ICollection = await CollectionModel.create({
          name: item.name,
          description: item.description || "",
          parentId: parentCollectionId,
        } as unknown as Partial<ICollection>);

        // Recursively parse folder items
        await this.parseItems(item.item, subCollection._id as Types.ObjectId);
      } else if (item.request) {
        // Parse individual request item
        await this.parseAndSaveRequest(item, parentCollectionId);
      }
    }
  }

  private async parseAndSaveRequest(item: any, collectionId: Types.ObjectId) {
    const reqData = item.request;

    const method = (reqData.method || "GET").toUpperCase();

    let rawUrl = "";
    const queryParamsMap = new Map<string, string>();

    if (typeof reqData.url === "string") {
      rawUrl = reqData.url;
    } else if (reqData.url && typeof reqData.url === "object") {
      rawUrl = reqData.url.raw || reqData.url.host?.join("/") || "";
      if (reqData.url.query && Array.isArray(reqData.url.query)) {
        for (const q of reqData.url.query) {
          if (q.key) queryParamsMap.set(q.key, String(q.value || ""));
        }
      }
    }

    const headersMap = new Map<string, string>();
    if (reqData.header && Array.isArray(reqData.header)) {
      for (const h of reqData.header) {
        if (h.key && !h.disabled) {
          headersMap.set(h.key, String(h.value || ""));
        }
      }
    }

    let bodyMode: "raw" | "json" | "form-data" | "none" = "none";
    let rawContent = "";

    if (reqData.body) {
      if (reqData.body.mode === "raw") {
        bodyMode = "raw";
        rawContent = reqData.body.raw || "";
      } else if (
        reqData.body.mode === "urlencoded" ||
        reqData.body.mode === "formdata"
      ) {
        bodyMode = "form-data";
        rawContent = JSON.stringify(reqData.body[reqData.body.mode] || {});
      }
    }

    let testScript = "";
    if (item.event && Array.isArray(item.event)) {
      const testEvent = item.event.find((e: any) => e.listen === "test");
      if (testEvent && testEvent.script && testEvent.script.exec) {
        testScript = Array.isArray(testEvent.script.exec)
          ? testEvent.script.exec.join("\n")
          : String(testEvent.script.exec);
      }
    }

    let preRequestScript = "";
    if (item.event && Array.isArray(item.event)) {
      const preEvent = item.event.find((e: any) => e.listen === "prerequest");
      if (preEvent && preEvent.script && preEvent.script.exec) {
        preRequestScript = Array.isArray(preEvent.script.exec)
          ? preEvent.script.exec.join("\n")
          : String(preEvent.script.exec);
      }
    }

    await RequestModel.create({
      collectionId,
      name: item.name || "Untitled Request",
      method,
      url: rawUrl,
      headers: headersMap,
      queryParams: queryParamsMap,
      body: {
        mode: bodyMode,
        rawContent,
      },
      preRequestScript,
      testScript,
    } as unknown as Partial<any>);
  }

  public async importOpenApiSpec(input: ImportOpenApiInput) {
    const { spec, collectionId } = input;
    const rootParentId = collectionId ? new Types.ObjectId(collectionId) : null;

    const baseUrl =
      spec.servers && spec.servers.length > 0 ? spec.servers[0].url : "";

    // 1. Create the root Collection container for the OpenAPI API
    const rootCollection: ICollection = await CollectionModel.create({
      name: spec.info.title,
      description: spec.info.description || "",
      parentId: rootParentId,
      variables: new Map([["baseUrl", baseUrl]]),
    } as unknown as Partial<ICollection>);

    const HTTP_METHODS = [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
    ];

    // 2. Iterate through paths and methods
    for (const [pathUrl, pathItem] of Object.entries(spec.paths)) {
      if (!pathItem || typeof pathItem !== "object") continue;

      for (const method of HTTP_METHODS) {
        const operation = (pathItem as Record<string, any>)[method];
        if (!operation) continue;

        const requestName =
          operation.summary ||
          operation.operationId ||
          `${method.toUpperCase()} ${pathUrl}`;
        const fullUrl = baseUrl ? `{{baseUrl}}${pathUrl}` : pathUrl;

        const headersMap = new Map<string, string>();
        const queryParamsMap = new Map<string, string>();

        // Parse Parameters (headers & query parameters)
        const parameters = operation.parameters || [];
        for (const param of parameters) {
          if (param.in === "header" && param.name) {
            headersMap.set(param.name, String(param.schema?.default || ""));
          } else if (param.in === "query" && param.name) {
            queryParamsMap.set(param.name, String(param.schema?.default || ""));
          }
        }

        // Parse Request Body (JSON handling)
        let bodyMode: "raw" | "json" | "form-data" | "none" = "none";
        let rawContent = "";

        if (operation.requestBody?.content) {
          const jsonContent = operation.requestBody.content["application/json"];
          if (jsonContent) {
            bodyMode = "json";
            if (jsonContent.example) {
              rawContent = JSON.stringify(jsonContent.example, null, 2);
            } else {
              rawContent = "{}";
            }
            headersMap.set("Content-Type", "application/json");
          }
        }

        // Save generated Request model
        await RequestModel.create({
          collectionId: rootCollection._id,
          name: requestName,
          method: method.toUpperCase(),
          url: fullUrl,
          headers: headersMap,
          queryParams: queryParamsMap,
          body: {
            mode: bodyMode,
            rawContent,
          },
        } as unknown as Partial<any>);
      }
    }

    return {
      success: true,
      importedCollectionId: rootCollection._id,
      name: rootCollection.name,
    };
  }
}
