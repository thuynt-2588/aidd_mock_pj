"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// Small toast for "Link copied — ready to share!" (B.3 / C.4.2).
const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function KudosToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [stamp, setStamp] = useState(0);
  const show = useCallback((text: string) => {
    setMessage(text);
    setStamp((s) => s + 1);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [message, stamp]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] flex justify-center px-4">
        {message && (
          <p role="status" className="rounded-lg border border-saa-border bg-saa-container-2 px-6 py-3 text-base font-bold text-saa-text shadow-lg">
            {message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}
