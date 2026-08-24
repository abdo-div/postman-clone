export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type StatusCodeClass = "2xx" | "4xx" | "5xx";

export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  name: string;
  url: string;
  statusCode: string;
  statusClass: StatusCodeClass;
  latencyMs: number;
  testsPassed: number | null;
  testsTotal: number | null;
  runAt: string;
}
