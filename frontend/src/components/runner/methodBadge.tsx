import React from "react";
import type { HttpMethod, ExecutionStatus } from "./types";

const methodStyles: Record<HttpMethod, string> = {
  GET: "bg-method-get-bg text-method-get-text",
  POST: "bg-method-post-bg text-method-post-text",
  PUT: "bg-method-post-bg text-method-post-text",
  PATCH: "bg-method-post-bg text-method-post-text",
  DELETE: "bg-method-delete-bg text-method-delete-text",
};

interface MethodBadgeProps {
  method: HttpMethod;
  status?: ExecutionStatus;
}

export const MethodBadge: React.FC<MethodBadgeProps> = ({ method, status }) => {
  const style =
    status === "pending"
      ? "bg-slate-800 text-slate-400"
      : methodStyles[method];

  return (
    <span
      className={`rounded px-1.5 py-0.5 font-code-sm text-code-sm font-bold ${style}`}
    >
      {method === "DELETE" && status === "pending" ? "DEL" : method}
    </span>
  );
};
