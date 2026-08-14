type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
  }
}

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  
  // Sanitização: não logar stack traces completos ou mensagens brutas em produção
  // apenas o tipo do erro e o contexto seguro.
  const isProd = window.location.hostname !== "localhost";
  const safeError = error instanceof Error 
    ? { name: error.name, message: isProd ? "Um erro inesperado ocorreu." : error.message }
    : "Unknown error";

  window.__lovableEvents?.captureException?.(
    safeError,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
      // Evitar PII
      timestamp: new Date().toISOString()
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}
