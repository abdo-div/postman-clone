type Tone = "emerald" | "amber" | "violet";

const toneClasses: Record<Tone, string> = {
  emerald: "text-emerald-400 bg-emerald-400/10",
  amber: "text-amber-400 bg-amber-400/10",
  violet: "text-[#8b5cf6] bg-[#8b5cf6]/10",
};

interface ExecutedRow {
  id: string;
  method: string;
  tone: Tone;
  endpoint: string;
  status: string;
  time: string;
}

const executedRows: ExecutedRow[] = [
  { id: "r1", method: "GET", tone: "emerald", endpoint: "/api/v2/cart/items", status: "200", time: "142ms" },
  { id: "r2", method: "POST", tone: "amber", endpoint: "/api/v2/checkout/validate", status: "201", time: "285ms" },
  { id: "r3", method: "PATCH", tone: "violet", endpoint: "/api/v2/users/me/address", status: "200", time: "92ms" },
];

export function RunnerPreview() {
  return (
    <div className="z-10 mx-12 flex w-full max-w-2xl flex-col overflow-hidden rounded-[8px] border border-outline-variant bg-surface-container-low shadow-2xl backdrop-blur-sm">
      {/* Window Header */}
      <div className="relative flex h-11 items-center gap-4 border-b border-outline-variant bg-surface-container-lowest px-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-outline-variant/60"></div>
          <div className="h-3 w-3 rounded-full bg-outline-variant/60"></div>
          <div className="h-3 w-3 rounded-full bg-outline-variant/60"></div>
        </div>
        <div className="absolute bottom-0 left-[72px] flex h-[34px] items-center gap-2 rounded-t-[4px] border-l border-r border-t-2 border-primary bg-surface-container-low px-4">
          <span
            style={{ fontVariationSettings: "'FILL' 1" }}
            className="material-symbols-outlined text-[16px] text-primary"
          >
            play_circle
          </span>
          <span className="font-body-sm text-body-sm font-semibold tracking-wide text-on-surface">
            Collection Runner
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Production Checkout Flow
            </h2>
            <p className="mt-1.5 flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">public</span>
              Environment:{" "}
              <span className="rounded-xs bg-primary/10 px-1.5 py-0.5 text-primary">production</span>
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-xs border border-outline-variant bg-surface-container px-3 py-1.5">
            <div className="flex flex-col items-center justify-center">
              <span className="mb-0.5 font-label-caps text-[9px] text-label-caps text-on-surface-variant">
                PASSED
              </span>
              <span className="font-code-md text-code-md font-bold text-emerald-400">18</span>
            </div>
            <div className="h-6 w-px bg-outline-variant"></div>
            <div className="flex flex-col items-center justify-center">
              <span className="mb-0.5 font-label-caps text-[9px] text-label-caps text-on-surface-variant">
                FAILED
              </span>
              <span className="font-code-md text-code-md font-bold text-on-surface-variant">0</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-xs border border-outline-variant/50 bg-surface-container/50 p-4">
          <div className="flex justify-between font-code-sm text-code-sm">
            <span className="text-on-surface-variant">Executing request 19 of 26...</span>
            <span className="font-bold text-primary">72%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div className="relative h-full w-[72%] overflow-hidden rounded-full bg-primary shadow-[0_0_12px_rgba(76,215,246,0.6)]">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xs border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center border-b border-outline-variant bg-surface-container-highest/60 px-4 py-2 font-label-caps text-label-caps text-on-surface-variant">
            <div className="w-20 pl-2">METHOD</div>
            <div className="grow pl-2">ENDPOINT</div>
            <div className="w-20 pr-2 text-right">STATUS</div>
            <div className="w-16 pr-2 text-right">TIME</div>
          </div>

          {executedRows.map((row) => (
            <div
              key={row.id}
              className="flex items-center border-b border-outline-variant px-4 py-2 transition-colors hover:bg-surface-container-highest/30"
            >
              <div className="w-20">
                <span
                  className={`rounded-xs px-1.5 py-0.5 font-code-sm font-bold text-code-sm ${toneClasses[row.tone]}`}
                >
                  {row.method}
                </span>
              </div>
              <div className="grow truncate pr-4 font-code-md text-code-md text-on-surface">
                {row.endpoint}
              </div>
              <div className="flex w-20 justify-end pr-2 text-emerald-400">
                <span className="mr-1.5 font-code-sm text-code-sm">{row.status}</span>
                <span
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  className="material-symbols-outlined text-[16px]"
                >
                  check_circle
                </span>
              </div>
              <div className="w-16 pr-2 text-right font-code-sm text-code-sm text-on-surface-variant">
                {row.time}
              </div>
            </div>
          ))}

          {/* Active row */}
          <div className="relative flex items-center bg-primary/5 px-4 py-2">
            <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-primary"></div>
            <div className="pointer-events-none absolute inset-0 bg-surface-container-high/30"></div>
            <div className="relative z-10 w-20">
              <span className="rounded-xs bg-amber-400/10 px-1.5 py-0.5 font-code-sm font-bold text-code-sm text-amber-400">
                POST
              </span>
            </div>
            <div className="relative z-10 grow truncate pr-4 font-code-md text-code-md text-primary">
              /api/v2/payments/charge
            </div>
            <div className="relative z-10 flex w-20 justify-end pr-2 text-primary">
              <span className="material-symbols-outlined animate-spin text-[16px]">
                progress_activity
              </span>
            </div>
            <div className="relative z-10 w-16 pr-2 text-right font-code-sm text-code-sm text-primary/70">
              ...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
