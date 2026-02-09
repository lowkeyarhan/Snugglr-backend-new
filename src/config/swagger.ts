import { Express } from "express";
import { config } from "./env";

const swaggerTags = ["auth", "profile", "chat", "match", "confession", "admin"];

const buildSummary = (method: string, path: string) => {
  const verbMap: Record<string, string> = {
    get: "Get",
    post: "Create",
    put: "Update",
    patch: "Update",
    delete: "Delete",
  };
  const clean = path.replace(/^\/api\//, "");
  const parts = clean.split("/").filter(Boolean);
  const resource = parts[0] || "resource";
  const tail = parts.slice(1).map((p) => p.replace(/[{}]/g, ""));
  if (resource === "profile" && tail[0] === "me") {
    return `${verbMap[method] || method} my profile`;
  }
  if (tail.length && /id$/i.test(tail[tail.length - 1])) {
    const target = tail.slice(0, -1).join(" ");
    return `${verbMap[method] || method} ${resource}${target ? ` ${target}` : ""} by id`;
  }
  const target = tail.join(" ");
  return `${verbMap[method] || method} ${resource}${target ? ` ${target}` : ""}`.trim();
};

const addSummaries = (spec: any) => {
  if (!spec.paths) {
    return spec;
  }
  Object.entries(spec.paths).forEach(([path, operations]) => {
    Object.entries(operations as Record<string, any>).forEach(
      ([method, operation]) => {
        if (!operation || typeof operation !== "object") {
          return;
        }
        const summary = buildSummary(method, path);
        if (!operation.summary || operation.summary === path) {
          operation.summary = summary;
        }
        if (!operation.description) {
          operation.description = `Endpoint to ${summary.toLowerCase()}.`;
        }
      },
    );
  });
  return spec;
};

export const setupSwaggerResponses = (app: Express) => {
  const expressOasGenerator = require("express-oas-generator");

  expressOasGenerator.handleResponses(app as any, {
    swaggerUiServePath: "api-docs",
    specOutputPath: "swagger.json",
    tags: swaggerTags,
    specOutputFileBehavior: "RECREATE",
    predefinedSpec: addSummaries,
  });
};

export const setupSwaggerRequests = () => {
  const expressOasGenerator = require("express-oas-generator");

  expressOasGenerator.handleRequests();

  console.log(
    `Swagger docs: http://localhost:${config.port}/api-docs/v2 (JSON: /api-spec/v2)`,
  );
};
