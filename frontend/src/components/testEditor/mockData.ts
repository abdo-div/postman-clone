import type { TestAssertion } from "./types";

export const assertions: TestAssertion[] = [
  {
    id: "status-200",
    name: "Status is 200",
    status: "passed",
    durationMs: "12ms",
  },
  {
    id: "auth-token",
    name: "Response body contains 'auth_token'",
    status: "failed",
    durationMs: null,
    error: "AssertionError: Expected 'auth_token' but found undefined",
  },
  {
    id: "response-time",
    name: "Response time is less than 500ms",
    status: "passed",
    durationMs: "142ms",
  },
];

export interface SnippetGroup {
  items: { label: string; title: string; accent?: boolean }[];
}

export const snippetGroups: SnippetGroup[] = [
  {
    items: [
      { label: "Get env variable", title: "Get an environment variable" },
      { label: "Set env variable", title: "Set an environment variable" },
    ],
  },
  {
    items: [
      { label: "Status is 200", title: "Check if status code is 200", accent: true },
      { label: "Body contains string", title: "Check if response body contains string" },
      { label: "JSON value check", title: "Check if JSON value equals expected" },
      {
        label: "Response time < 200ms",
        title: "Check if response time is less than 200ms",
        accent: true,
      },
    ],
  },
  {
    items: [{ label: "Clear env variable", title: "Clear an environment variable" }],
  },
];
