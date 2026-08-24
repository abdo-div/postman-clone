import { apiClient } from "./apiClient";
import type { Collection, RequestItem } from "./collectionService";

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
    let parsedJson: any = null;
    try {
      parsedJson = JSON.parse(trimmed);
    } catch {
      // Not raw JSON, could be YAML or backend can parse it
    }

    // Try backend endpoints first
    if (parsedJson) {
      if (parsedJson.info?.schema?.includes("postman") || type === "postman") {
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
    if (parsedJson?.info?.name) {
      return this.parsePostmanJson(parsedJson);
    }

    if (parsedJson?.paths) {
      return this.parseOpenApiJson(parsedJson);
    }

    throw new Error("Unable to identify format. Please provide valid Postman Collection or OpenAPI JSON/YAML.");
  },

  parsePostmanJson(postman: any): ImportResult {
    const colName = postman.info?.name || "Imported Postman Collection";
    const requests: RequestItem[] = [];

    const extractItems = (items: any[]) => {
      for (const item of items) {
        if (item.request) {
          const req = item.request;
          const url = typeof req.url === "string" ? req.url : req.url?.raw || "";
          const method = (req.method || "GET").toUpperCase();
          const headers = (req.header || []).map((h: any, i: number) => ({
            id: "h-" + i,
            enabled: !h.disabled,
            key: h.key || "",
            value: h.value || "",
            description: h.description || "",
          }));

          let body = "";
          if (req.body?.raw) {
            body = req.body.raw;
          }

          requests.push({
            id: "req-" + Math.random().toString(36).substring(2, 9),
            name: item.name || "Request",
            method,
            url,
            headers,
            queryParams: [],
            body,
            bodyType: body ? "json" : "none",
          });
        } else if (item.item && Array.isArray(item.item)) {
          extractItems(item.item);
        }
      }
    };

    if (Array.isArray(postman.item)) {
      extractItems(postman.item);
    }

    const collection: Collection = {
      id: "col-" + Date.now(),
      name: colName,
      description: postman.info?.description || "Imported from Postman collection",
      requests,
    };

    return { collection, requestsCount: requests.length };
  },

  parseOpenApiJson(openapi: any): ImportResult {
    const colName = openapi.info?.title || "Imported OpenAPI";
    const baseUrl = openapi.servers?.[0]?.url || "https://api.example.com";
    const requests: RequestItem[] = [];

    if (openapi.paths) {
      for (const [path, methods] of Object.entries(openapi.paths)) {
        for (const [method, details] of Object.entries(methods as any)) {
          if (["get", "post", "put", "delete", "patch", "options", "head"].includes(method.toLowerCase())) {
            const op = details as any;
            const fullUrl = baseUrl.endsWith("/") ? `${baseUrl.slice(0, -1)}${path}` : `${baseUrl}${path}`;
            requests.push({
              id: "req-" + Math.random().toString(36).substring(2, 9),
              name: op.summary || op.operationId || `${method.toUpperCase()} ${path}`,
              method: method.toUpperCase() as any,
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
      description: openapi.info?.description || "Imported from OpenAPI specification",
      requests,
    };

    return { collection, requestsCount: requests.length };
  },

  parseCurl(curlCmd: string): ImportResult {
    let method: any = "GET";
    let url = "";
    const headers: any[] = [];
    let body = "";

    const methodMatch = curlCmd.match(/-X\s+([A-Z]+)/i) || curlCmd.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) method = methodMatch[1].toUpperCase();

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
