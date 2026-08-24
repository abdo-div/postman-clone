import React, { useState } from "react";
import { importService } from "../../services/importService";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useToastStore } from "../../store/useToastStore";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

type ImportTab = "file" | "url" | "text" | "curl";

export const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onConfirm }) => {
  const [activeTab, setActiveTab] = useState<ImportTab>("file");
  const [rawText, setRawText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [curlText, setCurlText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importType, setImportType] = useState<"auto" | "postman" | "openapi">("auto");

  const { collections, addCollection } = useCollectionStore();
  const { addToast } = useToastStore();

  if (!open) return null;

  const handleImportContent = async (content: string, type: "auto" | "postman" | "openapi" | "curl" = importType) => {
    if (!content.trim()) {
      addToast({ type: "warning", title: "Empty content", description: "Please provide content to import" });
      return;
    }
    setIsImporting(true);
    try {
      const result = await importService.importDefinition(content, type as any);
      // Add to collection store
      const newCol = await addCollection(result.collection.name, result.collection.description);
      // We need to also add the requests
      const { addRequest } = useCollectionStore.getState();
      for (const req of result.collection.requests || []) {
        addRequest(newCol.id, req);
      }

      addToast({
        type: "success",
        title: "Import successful!",
        description: `Imported "${result.collection.name}" with ${result.requestsCount} request(s)`,
        duration: 5000,
      });
      onConfirm?.();
      onClose();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Import failed",
        description: err.message || "Could not parse the provided content",
        duration: 6000,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const content = await file.text();
    await handleImportContent(content, "auto");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleUrlFetch = async () => {
    if (!urlInput.trim()) return;
    setIsImporting(true);
    try {
      const res = await fetch(urlInput);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const content = await res.text();
      await handleImportContent(content, "auto");
    } catch (err: any) {
      addToast({ type: "error", title: "Fetch failed", description: err.message });
      setIsImporting(false);
    }
  };

  const tabs: { id: ImportTab; label: string; icon: string }[] = [
    { id: "file", label: "File / Drag & Drop", icon: "upload_file" },
    { id: "url", label: "URL", icon: "link" },
    { id: "text", label: "Raw JSON", icon: "code" },
    { id: "curl", label: "cURL", icon: "terminal" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant p-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Import API Definition</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Supports Postman Collection v2.1, OpenAPI 3.0/Swagger, and cURL commands
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-outline-variant bg-surface-container-low px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {/* Format selector */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-on-surface-variant">Format:</span>
            {([["auto", "Auto-detect"], ["postman", "Postman v2.1"], ["openapi", "OpenAPI 3.0"]] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={importType === val} onChange={() => setImportType(val)} className="accent-cyan-400" />
                <span className={importType === val ? "text-primary" : "text-on-surface-variant"}>{label}</span>
              </label>
            ))}
          </div>

          {/* File Tab */}
          {activeTab === "file" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                isDragging ? "border-primary bg-primary-container/20" : "border-outline-variant hover:border-outline"
              }`}
            >
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">cloud_upload</span>
              <p className="text-sm font-medium text-on-surface">Drag & drop a file here</p>
              <p className="text-xs text-on-surface-variant mt-1">.json, .yaml, .yml files supported</p>
              <label className="mt-4 cursor-pointer rounded bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container hover:bg-primary-fixed transition-colors">
                Choose File
                <input type="file" accept=".json,.yaml,.yml" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          )}

          {/* URL Tab */}
          {activeTab === "url" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml"
                  className="flex-1 rounded border border-outline-variant bg-surface-container-low px-3 py-2 font-code-sm text-sm text-on-surface outline-none focus:border-primary"
                  onKeyDown={(e) => { if (e.key === "Enter") handleUrlFetch(); }}
                />
                <button
                  onClick={handleUrlFetch}
                  disabled={isImporting || !urlInput.trim()}
                  className="rounded bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container hover:bg-primary-fixed transition-colors disabled:opacity-50"
                >
                  Fetch
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">Provide a public URL to a Postman collection or OpenAPI spec</p>
            </div>
          )}

          {/* Raw Text Tab */}
          {activeTab === "text" && (
            <div className="space-y-3">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Paste your Postman Collection JSON or OpenAPI spec here...\n\nExample:\n{\n  "info": { "name": "My API", "_postman_id": "...", "schema": "https://schema.getpostman.com/..." },\n  "item": [...]\n}`}
                className="h-48 w-full resize-none rounded border border-outline-variant bg-surface-container-low p-3 font-code-sm text-sm text-on-surface outline-none focus:border-primary"
                spellCheck={false}
              />
              <button
                onClick={() => handleImportContent(rawText)}
                disabled={isImporting || !rawText.trim()}
                className="w-full rounded bg-primary-container py-2.5 text-sm font-bold text-on-primary-container hover:bg-primary-fixed transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Importing...</>
                ) : "Import JSON"}
              </button>
            </div>
          )}

          {/* cURL Tab */}
          {activeTab === "curl" && (
            <div className="space-y-3">
              <textarea
                value={curlText}
                onChange={(e) => setCurlText(e.target.value)}
                placeholder={`Paste cURL command here...\n\ncurl -X POST 'https://api.example.com/users' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer {{token}}' \\\n  -d '{"name": "John", "email": "john@example.com"}'`}
                className="h-48 w-full resize-none rounded border border-outline-variant bg-surface-container-low p-3 font-code-sm text-sm text-on-surface outline-none focus:border-primary"
                spellCheck={false}
              />
              <button
                onClick={() => handleImportContent(curlText, "curl")}
                disabled={isImporting || !curlText.trim()}
                className="w-full rounded bg-primary-container py-2.5 text-sm font-bold text-on-primary-container hover:bg-primary-fixed transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Importing...</>
                ) : "Import cURL"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-dim px-6 py-3">
          <p className="text-xs text-on-surface-variant">
            {collections.length} collection(s) currently in workspace
          </p>
          <button onClick={onClose} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2 rounded hover:bg-surface-container">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
