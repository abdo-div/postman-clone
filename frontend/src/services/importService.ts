import { apiClient } from "./apiClient";
import type { Collection, RequestItem, HeaderItem } from "./collectionService";

export interface ImportResult {
  collection: Collection;
  requestsCount: number;
}

export const importService = {
  /**
   * Import Postman v2.1 or OpenAPI definition via backend or client-side parser
   */
  async importDefinition(
    content: string,
    type: "postman" | "openapi" | "curl" | "auto" = "auto",
  ): Promise<ImportResult> {
    const trimmed = content.trim();

    // Check if it's a cURL command
    if (trimmed.startsWith("curl") || type === "curl") {
      return this.parseCurl(trimmed);
    }

    // Try JSON parsing
    let parsedJson: Record<string, unknown> | null = null;
    try {
      parsedJson = JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      // Not raw JSON, could be YAML or backend can parse it
    }

    // Try backend endpoints first
    if (parsedJson) {
      const info = parsedJson.info as Record<string, unknown> | undefined;
      if ((typeof info?.schema === "string" && info.schema.includes("postman")) || type === "postman") {
        try {
          const res = await apiClient.post("/import/postman", { collection: parsedJson });
          if (res.data?.data) {
            return {
              collection: res.data.data,
              requestsCount: res.data.data.requests?.length || 1,
            };
          }
        } catch {
          // fallback to client-side parse
        }
        return this.parsePostmanJson(parsedJson);
      }

      if (parsedJson.openapi || parsedJson.swagger || type === "openapi") {
        try {
          const res = await apiClient.post("/import/openapi", { spec: parsedJson });
          if (res.data?.data) {
            return {
              collection: res.data.data,
              requestsCount: res.data.data.requests?.length || 1,
            };
          }
        } catch {
          // fallback to client-side parse
        }
        return this.parseOpenApiJson(parsedJson);
      }
    }

    // Client-side fallback heuristics
    if (parsedJson?.info && typeof (parsedJson.info as Record<string, unknown>).name === "string") {
      return this.parsePostmanJson(parsedJson);
    }

    if (parsedJson?.paths) {
      return this.parseOpenApiJson(parsedJson);
    }

    throw new Error("Unable to identify format. Please provide valid Postman Collection or OpenAPI JSON/YAML.");
  },

  parsePostmanJson(postman: Record<string, unknown>): ImportResult {
    const info = postman.info as Record<string, unknown> | undefined;
    const colName = (info?.name as string) || "Imported Postman Collection";
    const requests: RequestItem[] = [];

    const extractItems = (items: Array<Record<string, unknown>>) => {
      for (const item of items) {
        if (item.request) {
          const req = item.request as Record<string, unknown>;
          const urlObj = req.url;
          const url = typeof urlObj === "string" ? urlObj : (urlObj as Record<string, unknown>)?.raw as string || "";
          const method = ((req.method as string) || "GET").toUpperCase();
          const headers = ((req.header as Array<Record<string, unknown>>) || []).map((h, i) => ({
            id: "h-" + i,
            enabled: !h.disabled,
            key: (h.key as string) || "",
            value: (h.value as string) || "",
            description: (h.description as string) || "",
          }));

          let body = "";
          const bodyObj = req.body as Record<string, unknown> | undefined;
          if (bodyObj?.raw) {
            body = bodyObj.raw as string;
          }

          requests.push({
            id: "req-" + Math.random().toString(36).substring(2, 9),
            name: (item.name as string) || "Request",
            method: method as RequestItem["method"],
            url,
            headers,
            queryParams: [],
            body,
            bodyType: body ? "json" : "none",
          });
        } else if (item.item && Array.isArray(item.item)) {
          extractItems(item.item as Array<Record<string, unknown>>);
        }
      }
    };

    if (Array.isArray(postman.item)) {
      extractItems(postman.item as Array<Record<string, unknown>>);
    }

    const collection: Collection = {
      id: "col-" + Date.now(),
      name: colName,
      description: ((postman.info as Record<string, unknown>)?.description as string) || "Imported from Postman collection",
      requests,
    };

    return { collection, requestsCount: requests.length };
  },

  parseOpenApiJson(openapi: Record<string, unknown>): ImportResult {
    const info = openapi.info as Record<string, unknown> | undefined;
    const colName = (info?.title as string) || "Imported OpenAPI";
    const servers = openapi.servers as Array<Record<string, unknown>> | undefined;
    const baseUrl = (servers?.[0]?.url as string) || "https://api.example.com";
    const requests: RequestItem[] = [];

    const paths = openapi.paths as Record<string, Record<string, Record<string, unknown>>> | undefined;
    if (paths) {
      for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods)) {
          if (["get", "post", "put", "delete", "patch", "options", "head"].includes(method.toLowerCase())) {
            const fullUrl = baseUrl.endsWith("/") ? `${baseUrl.slice(0, -1)}${path}` : `${baseUrl}${path}`;
            requests.push({
              id: "req-" + Math.random().toString(36).substring(2, 9),
              name: ((details.summary as string) || (details.operationId as string) || `${method.toUpperCase()} ${path}`),
              method: method.toUpperCase() as RequestItem["method"],
              url: fullUrl,
              headers: [
                { id: "h1", enabled: true, key: "Content-Type", value: "application/json", description: "" },
              ],
              queryParams: [],
              bodyType: "none",
            });
          }
        }
      }
    }

    const collection: Collection = {
      id: "col-" + Date.now(),
      name: colName,
      description: (info?.description as string) || "Imported from OpenAPI specification",
      requests,
    };

    return { collection, requestsCount: requests.length };
  },

  parseCurl(curlCmd: string): ImportResult {
    let method: RequestItem["method"] = "GET";
    let url = "";
    const headers: HeaderItem[] = [];
    let body = "";

    const methodMatch = curlCmd.match(/-X\s+([A-Z]+)/i) || curlCmd.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) method = methodMatch[1].toUpperCase() as RequestItem["method"];

    const urlMatch = curlCmd.match(/'(https?:\/\/[^']+)'/) || curlCmd.match(/"(https?:\/\/[^"]+)"/) || curlCmd.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) url = urlMatch[1];

    const headerMatches = [...curlCmd.matchAll(/-H\s+['"]([^'"]+)['"]/g)];
    headerMatches.forEach((m, idx) => {
      const parts = m[1].split(":");
      if (parts.length >= 2) {
        headers.push({
          id: "h-" + idx,
          enabled: true,
          key: parts[0].trim(),
          value: parts.slice(1).join(":").trim(),
        });
      }
    });

    const dataMatch = curlCmd.match(/--data\s+['"]([^'"]+)['"]/) || curlCmd.match(/-d\s+['"]([^'"]+)['"]/);
    if (dataMatch) {
      body = dataMatch[1];
      if (method === "GET") method = "POST";
    }

    const request: RequestItem = {
      id: "req-" + Date.now(),
      name: `cURL Request (${method})`,
      method,
      url: url || "https://api.example.com",
      headers,
      queryParams: [],
      body,
      bodyType: body ? "json" : "none",
    };

    const collection: Collection = {
      id: "col-" + Date.now(),
      name: "cURL Imports",
      description: "Commands imported from raw cURL",
      requests: [request],
    };

    return { collection, requestsCount: 1 };
  },
};
