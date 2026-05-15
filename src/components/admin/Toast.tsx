"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

// ─── Context ─────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = String(++counter.current);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const ICONS = {
    success: <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#4ADE80" }} />,
    error: <XCircle className="w-4 h-4 shrink-0" style={{ color: "#FF4444" }} />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#F59E0B" }} />,
  };
  const ACCENT = { success: "#4ADE80", error: "#FF4444", warning: "#F59E0B" };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-80">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="flex items-start gap-3 px-4 py-3"
              style={{
                background: "var(--color-card)",
                border: `1px solid ${ACCENT[t.type]}33`,
                boxShadow: `0 0 0 1px ${ACCENT[t.type]}1A`,
              }}
            >
              {ICONS[t.type]}
              <p className="text-xs font-bold flex-1 leading-relaxed" style={{ color: "var(--color-foreground)" }}>
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 transition-opacity hover:opacity-50"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
