import type { SnippetGroup } from "./types";

export const snippetGroups: SnippetGroup[] = [
  {
    items: [
      {
        label: "Status is 200",
        title: "Check if status code is 200",
        snippet: `pm.test("Status is 200", function () {\n    pm.response.to.have.status(200);\n});`,
        accent: true,
      },
      {
        label: "Status is 201",
        title: "Check if status code is 201",
        snippet: `pm.test("Status is 201", function () {\n    pm.response.to.have.status(201);\n});`,
      },
      {
        label: "Status is 4xx",
        title: "Check if status is a client error",
        snippet: `pm.test("Client error response", function () {\n    pm.response.to.be.clientError();\n});`,
      },
    ],
  },
  {
    items: [
      {
        label: "Response time < 500ms",
        title: "Check if response time is below 500ms",
        snippet: `pm.test("Response time < 500ms", function () {\n    pm.expect(pm.response.responseTime).to.be.below(500);\n});`,
        accent: true,
      },
      {
        label: "Response time < 200ms",
        title: "Check if response time is below 200ms",
        snippet: `pm.test("Response time < 200ms", function () {\n    pm.expect(pm.response.responseTime).to.be.below(200);\n});`,
      },
    ],
  },
  {
    items: [
      {
        label: "JSON property exists",
        title: "Check if a property exists in the response",
        snippet: `pm.test("Property 'id' exists", function () {\n    const data = pm.response.json();\n    pm.expect(data).to.have.property("id");\n});`,
      },
      {
        label: "JSON value equals",
        title: "Check if a JSON value equals expected",
        snippet: `pm.test("Value equals expected", function () {\n    const data = pm.response.json();\n    pm.expect(data.key).to.equal("expected_value");\n});`,
      },
      {
        label: "Body contains string",
        title: "Check if response body contains a string",
        snippet: `pm.test("Body contains 'success'", function () {\n    pm.expect(pm.response.text()).to.include("success");\n});`,
      },
      {
        label: "Response is JSON",
        title: "Verify response is valid JSON",
        snippet: `pm.test("Response is valid JSON", function () {\n    const data = pm.response.json();\n    pm.expect(data).to.be.a("object");\n});`,
      },
    ],
  },
  {
    items: [
      {
        label: "Get env variable",
        title: "Read an environment variable",
        snippet: `const value = pm.environment.get("variable_name");`,
      },
      {
        label: "Set env variable",
        title: "Set an environment variable",
        snippet: `pm.environment.set("variable_name", "value");`,
      },
      {
        label: "Clear env variable",
        title: "Unset an environment variable",
        snippet: `pm.environment.unset("variable_name");`,
      },
    ],
  },
];
