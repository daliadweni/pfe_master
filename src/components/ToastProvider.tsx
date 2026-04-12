"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✗",
  info: "ℹ",
  warning: "⚠",
};

const colors: Record<ToastType, string> = {
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200",
  error:
    "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/60 dark:text-red-200",
  info: "border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200",
  warning:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
};

const iconBg: Record<ToastType, string> = {
  success: "bg-emerald-200 dark:bg-emerald-800",
  error: "bg-red-200 dark:bg-red-800",
  info: "bg-indigo-200 dark:bg-indigo-800",
  warning: "bg-amber-200 dark:bg-amber-800",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 250);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <Ctx value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="pointer-events-none fixed left-0 right-0 top-4 z-[100] flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              t.exiting ? "animate-toast-exit" : "animate-toast-enter"
            } ${colors[t.type]}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${iconBg[t.type]}`}
            >
              {icons[t.type]}
            </span>
            <span className="text-sm font-medium">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="mr-1 text-current opacity-50 transition hover:opacity-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </Ctx>
  );
}
