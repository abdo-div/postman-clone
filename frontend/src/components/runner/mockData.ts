import type { FeedItem, RunnerDetail, RunnerMetric } from "./types";

export const collectionName = "Runner: User Authentication Suite";

export const runProgress = 72;

export const metrics: RunnerMetric[] = [
  { label: "Requests", value: "25 / 35" },
  { label: "Passed", value: "18", accent: "pass" },
  { label: "Failed", value: "1", accent: "fail" },
  { label: "Avg Latency", value: "112ms" },
];

export const feedItems: FeedItem[] = [
  {
    id: "login",
    method: "POST",
    name: "Login",
    status: "passed",
    statusCode: "200 OK",
    statusCodeOk: true,
    latencyMs: 142,
    testsPassed: 3,
    testsTotal: 3,
  },
  {
    id: "get-profile",
    method: "GET",
    name: "Get Profile",
    status: "passed",
    statusCode: "200 OK",
    statusCodeOk: true,
    latencyMs: 89,
    testsPassed: 2,
    testsTotal: 2,
  },
  {
    id: "update-avatar",
    method: "POST",
    name: "Update Avatar",
    status: "failed",
    statusCode: "401 Unauthorized",
    statusCodeOk: false,
    latencyMs: 210,
    testsPassed: 0,
    testsTotal: 1,
  },
  {
    id: "remove-session",
    method: "DELETE",
    name: "Remove Session",
    status: "pending",
  },
];

export const detail: RunnerDetail = {
  name: "Update Avatar",
  method: "POST",
  url: "https://api.example.com/v1/user/avatar",
  failed: true,
  failures: [
    {
      name: "Status code is 200",
      message: "Expected status 200, got 401",
    },
  ],
};
