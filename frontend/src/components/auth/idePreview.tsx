import React from "react";

const jsonLines: React.ReactNode[] = [
  <span className="text-on-surface-variant">{"{"}</span>,
  <>
    <span className="text-tertiary-container">"status"</span>
    <span className="text-on-surface-variant">: </span>
    <span className="text-[#a3defe]">"success"</span>
    <span className="text-on-surface-variant">,</span>
  </>,
  <>
    <span className="text-tertiary-container">"data"</span>
    <span className="text-on-surface-variant">: [</span>
  </>,
  <span className="text-on-surface-variant">{"{"}</span>,
  <>
    <span className="text-tertiary-container">"id"</span>
    <span className="text-on-surface-variant">: </span>
    <span className="text-amber-400">uuid_09a8b</span>
    <span className="text-on-surface-variant">,</span>
  </>,
  <>
    <span className="text-tertiary-container">"role"</span>
    <span className="text-on-surface-variant">: </span>
    <span className="text-[#a3defe]">"admin"</span>
    <span className="text-on-surface-variant">,</span>
  </>,
  <>
    <span className="text-tertiary-container">"email"</span>
    <span className="text-on-surface-variant">: </span>
    <span className="text-[#a3defe]">"dev@example.com"</span>
    <span className="text-on-surface-variant">,</span>
  </>,
  <>
    <span className="text-tertiary-container">"last_active"</span>
    <span className="text-on-surface-variant">: </span>
    <span className="text-[#a3defe]">"2023-10-27T08:42:00Z"</span>
  </>,
  <span className="text-on-surface-variant">{"}"}</span>,
  <span className="text-on-surface-variant">]</span>,
  <span className="text-on-surface-variant">{"}"}</span>,
];

export function IdePreview() {
  return (
    <div className="relative z-10 flex h-[600px] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low shadow-2xl">
      {/* Window Header */}
      <div className="flex h-10 select-none items-center gap-4 border-b border-outline-variant bg-surface-container-highest px-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-outline-variant"></div>
          <div className="h-3 w-3 rounded-full bg-outline-variant"></div>
          <div className="h-3 w-3 rounded-full bg-outline-variant"></div>
        </div>
        <div className="-mb-px flex h-full">
          <div className="flex h-full items-center gap-2 border-b-2 border-primary-container bg-surface-container-low px-4 text-on-surface">
            <span className="rounded bg-emerald-400/10 px-1 py-0.5 font-code-sm uppercase text-code-sm text-emerald-400">
              GET
            </span>
            <span className="font-body-sm text-body-sm font-semibold">/api/v1/users</span>
            <span className="ml-2 cursor-pointer text-[14px] text-on-surface-variant material-symbols-outlined hover:text-on-surface">
              close
            </span>
          </div>
          <div className="flex h-full cursor-pointer items-center gap-2 border-l border-r border-outline-variant bg-surface-container-highest px-4 text-on-surface-variant transition-colors hover:bg-surface-variant">
            <span className="rounded bg-amber-400/10 px-1 py-0.5 font-code-sm uppercase text-code-sm text-amber-400">
              POST
            </span>
            <span className="font-body-sm text-body-sm">/api/v1/auth</span>
          </div>
        </div>
      </div>

      {/* IDE Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Request Panel */}
        <div className="flex w-1/2 flex-col border-r border-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-2 border-b border-outline-variant p-2">
            <div className="flex flex-1 items-center gap-2 rounded border border-outline-variant bg-surface-container-highest px-2 py-1">
              <span className="font-code-sm text-code-sm text-emerald-400">GET</span>
              <span className="text-outline">|</span>
              <span className="truncate font-code-md text-code-md text-on-surface">
                {"{{BASE_URL}}"}/users?role=admin
              </span>
            </div>
            <button
              disabled
              className="flex cursor-not-allowed items-center gap-1 rounded bg-primary-container px-3 py-1 font-body-sm text-body-sm font-bold text-on-primary-container opacity-50"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              Send
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 font-code-sm text-code-sm text-on-surface-variant">
            <div className="grid grid-cols-[auto_1fr_1fr] gap-0 rounded-sm border border-outline-variant">
              <div className="flex items-center justify-center border-b border-r border-outline-variant bg-surface-container-highest px-2 py-1">
                <span className="material-symbols-outlined text-[12px]">check_box</span>
              </div>
              <div className="border-b border-r border-outline-variant bg-surface-container-highest px-2 py-1">
                Key
              </div>
              <div className="border-b border-outline-variant bg-surface-container-highest px-2 py-1">
                Value
              </div>

              <div className="flex items-center justify-center border-b border-r border-outline-variant px-2 py-1">
                <span className="material-symbols-outlined text-[12px] text-primary">
                  check_box
                </span>
              </div>
              <div className="border-b border-r border-outline-variant px-2 py-1 text-on-surface">
                role
              </div>
              <div className="border-b border-outline-variant px-2 py-1 text-[#a3defe]">admin</div>

              <div className="flex items-center justify-center border-b border-r border-outline-variant opacity-50 px-2 py-1">
                <span className="material-symbols-outlined text-[12px]">
                  check_box_outline_blank
                </span>
              </div>
              <div className="border-b border-r border-outline-variant px-2 py-1">limit</div>
              <div className="border-b border-outline-variant px-2 py-1 text-[#a3defe]">50</div>

              <div className="flex items-center justify-center border-r border-outline-variant opacity-50 px-2 py-1">
                <span className="material-symbols-outlined text-[12px]">
                  check_box_outline_blank
                </span>
              </div>
              <div className="border-r border-outline-variant px-2 py-1 italic">New key</div>
              <div className="px-2 py-1 italic">Value</div>
            </div>
          </div>
        </div>

        {/* Response Panel */}
        <div className="flex w-1/2 flex-col bg-panel-level-1">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-highest p-2 font-code-sm text-code-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                200 OK
              </span>
              <span className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">timer</span>142 ms
              </span>
              <span className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">save</span>2.4 KB
              </span>
            </div>
          </div>

          <div className="relative flex flex-1 overflow-hidden">
            <div className="w-10 shrink-0 select-none border-r border-outline-variant bg-surface-container-lowest py-2 pr-2 text-right font-code-sm text-code-sm text-outline-variant">
              {jsonLines.map((_, index) => (
                <React.Fragment key={index}>
                  {index + 1}
                  {index < jsonLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            <div className="flex-1 whitespace-pre overflow-auto px-4 py-2 font-code-sm text-code-sm">
              {jsonLines.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            <div className="pointer-events-none absolute left-0 right-0 top-[28px] h-[20px] bg-surface-container-highest/30"></div>
          </div>

          <div className="border-t border-outline-variant bg-surface-container-highest p-3">
            <div className="mb-2 font-label-caps text-label-caps text-on-surface-variant">
              TEST RESULTS (2/2)
            </div>
            <div className="space-y-1 font-code-sm text-code-sm">
              {["Status is 200", "Response is JSON"].map((test) => (
                <div key={test} className="flex items-center gap-2 text-emerald-400">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  <span>{test}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
