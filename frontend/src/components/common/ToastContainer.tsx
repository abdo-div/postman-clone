import { useToastStore, type ToastMessage } from "../../store/useToastStore";

const iconMap: Record<ToastMessage["type"], string> = {
  success: "check_circle",
  error: "cancel",
  warning: "warning",
  info: "info",
};

const colorMap: Record<ToastMessage["type"], string> = {
  success: "border-emerald-500/40 bg-emerald-900/80 text-emerald-200",
  error: "border-red-500/40 bg-red-900/80 text-red-200",
  warning: "border-amber-500/40 bg-amber-900/80 text-amber-200",
  info: "border-cyan-500/40 bg-cyan-900/80 text-cyan-200",
};

const iconColorMap: Record<ToastMessage["type"], string> = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-cyan-400",
};

function ToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 ${colorMap[toast.type]}`}
      style={{ minWidth: "280px", maxWidth: "400px" }}
    >
      <span
        className={`material-symbols-outlined mt-0.5 shrink-0 text-xl ${iconColorMap[toast.type]}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {iconMap[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs opacity-80 leading-tight">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
