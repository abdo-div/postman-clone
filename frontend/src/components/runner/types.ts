export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ExecutionStatus = "passed" | "failed" | "pending";

export interface FeedItem {
  id: string;
  method: HttpMethod;
  name: string;
  status: ExecutionStatus;
  statusCode?: string;
  statusCodeOk?: boolean;
  latencyMs?: number;
  testsPassed?: number;
  testsTotal?: number;
}

export interface AssertionFailure {
  name: string;
  message: string;
}

export interface RunnerDetail {
  name: string;
  method: HttpMethod;
  url: string;
  failed: boolean;
  failures: AssertionFailure[];
}

export interface RunnerMetric {
  label: string;
  value: string;
  accent?: "pass" | "fail";
}
