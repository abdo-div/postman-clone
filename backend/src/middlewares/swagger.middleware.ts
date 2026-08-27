import type { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API Workbench",
      description: "REST API for the Postman-clone API Workbench",
      version: "1.0.0",
    },
    servers: [{ url: "/api/v1", description: "API v1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Collection: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            workspaceId: { type: "string" },
            requests: { type: "array", items: { $ref: "#/components/schemas/Request" } },
          },
        },
        Request: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] },
            url: { type: "string" },
            headers: { type: "object" },
            queryParams: { type: "array" },
            bodyType: { type: "string" },
            body: { type: "string" },
            auth: { type: "object" },
            testsScript: { type: "string" },
            preRequestScript: { type: "string" },
          },
        },
        Environment: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            variables: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  value: { type: "string" },
                  secret: { type: "boolean" },
                },
              },
            },
          },
        },
        ExecuteRequest: {
          type: "object",
          required: ["url", "method"],
          properties: {
            url: { type: "string" },
            method: { type: "string" },
            headers: { type: "object" },
            body: {},
            environmentVariables: { type: "object" },
            timeoutMs: { type: "number" },
          },
        },
        HistoryItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            method: { type: "string" },
            url: { type: "string" },
            status: { type: "number" },
            statusText: { type: "string" },
            durationMs: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        AuthRegister: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        AuthLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Application): void {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "API Workbench Docs",
    customCss: ".swagger-ui .topbar { display: none }",
  }));

  app.get("/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
