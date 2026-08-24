import React, { useState } from "react";
import { apiPreview } from "./mockData";
import type { EndpointMethod } from "./types";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

const methodBadgeStyles: Record<EndpointMethod, string> = {
  GET: "bg-primary/10 text-primary",
  POST: "bg-secondary/10 text-secondary",
  PUT: "bg-tertiary/10 text-tertiary",
  PATCH: "bg-tertiary/10 text-tertiary",
  DELETE: "bg-error/10 text-error",
};

const tabs = [
  { id: "file", label: "File Upload", icon: "upload_file" },
  { id: "link", label: "Link", icon: "link" },
  { id: "raw", label: "Raw Text", icon: "data_object" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onConfirm }) => {
  const [activeTab, setActiveTab] = useState<TabId>("file");

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[921px] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-high/50 px-6 py-4">
          <h2 className="m-0 font-headline-md text-headline-md text-on-surface">
            Import API Definition
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex border-b border-outline-variant bg-surface-container-lowest px-4 pt-2">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-body-md text-body-md ${
                    isActive
                      ? "-mb-[1px] z-10 rounded-t-sm border-l border-r border-t-2 border-outline-variant border-t-primary bg-surface-container text-on-surface"
                      : "text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-6 p-6">
            {activeTab === "file" && (
              <>
                <div className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-outline bg-surface-container-lowest p-8 text-center transition-colors duration-200 hover:border-primary">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <span className="material-symbols-outlined text-[28px] text-on-surface-variant group-hover:text-primary">
                      cloud_upload
                    </span>
                  </div>
                  <p className="mb-1 font-body-md text-body-md text-on-surface">
                    Drop OpenAPI JSON/YAML or Postman Collection
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    or click to browse from your computer
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-body-md text-body-md font-semibold text-on-surface">
                      Preview
                    </h3>
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-code-sm text-code-sm text-primary">
                      {apiPreview.endpoints.length + apiPreview.extraEndpoints} endpoints found
                    </span>
                  </div>

                  <div className="flex items-start gap-4 rounded-lg border border-outline-variant bg-surface-container-highest p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-secondary-container/20">
                      <span className="material-symbols-outlined text-secondary">api</span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="m-0 font-body-md text-body-md font-semibold text-on-surface">
                          {apiPreview.title}
                        </h4>
                        <span className="rounded-sm border border-outline-variant px-1.5 font-code-sm text-code-sm text-on-surface-variant">
                          {apiPreview.spec}
                        </span>
                      </div>
                      <p className="m-0 w-full max-w-md truncate font-body-sm text-body-sm text-on-surface-variant">
                        {apiPreview.baseUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
                    <div className="flex items-center border-b border-outline-variant bg-surface-container-high/30 px-2 py-2">
                      <div className="w-20 font-label-caps text-label-caps text-on-surface-variant">
                        Method
                      </div>
                      <div className="flex-1 font-label-caps text-label-caps text-on-surface-variant">
                        Path
                      </div>
                    </div>

                    <div className="flex max-h-[160px] flex-col overflow-y-auto">
                      {apiPreview.endpoints.map((endpoint) => (
                        <div
                          key={endpoint.id}
                          className="group flex items-center border-b border-outline-variant/50 px-2 py-1.5 last:border-b-0 hover:bg-surface-container-highest/50"
                        >
                          <div className="flex w-20 shrink-0 items-center">
                            <span
                              className={`rounded px-1.5 py-0.5 font-code-sm text-code-sm font-bold uppercase ${methodBadgeStyles[endpoint.method]}`}
                            >
                              {endpoint.method}
                            </span>
                          </div>
                          <div className="flex-1 truncate font-code-md text-code-md text-on-surface transition-colors group-hover:text-primary-fixed">
                            {endpoint.path}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-outline-variant bg-surface-container-lowest py-2 text-center">
                      <span className="cursor-pointer font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-primary">
                        + {apiPreview.extraEndpoints} more endpoints
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "link" && (
              <div className="flex flex-col gap-3">
                <label className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Specification URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.example.com/openapi.json"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-code-sm text-code-sm text-on-surface focus:border-primary focus:outline-none"
                />
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Paste a URL to an OpenAPI/Swagger definition or Postman Collection.
                </p>
              </div>
            )}

            {activeTab === "raw" && (
              <div className="flex flex-col gap-3">
                <label className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Definition Content
                </label>
                <textarea
                  rows={10}
                  placeholder='{"openapi": "3.0.0", "info": {"title": "..."}, ...}'
                  className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest p-3 font-code-sm text-code-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-4">
          <button
            onClick={onClose}
            className="rounded border border-outline-variant px-4 py-2 font-body-md text-body-md text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 rounded bg-primary px-5 py-2 font-body-md text-body-md font-medium text-on-primary shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-colors hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
};
