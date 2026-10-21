import { useSyncExternalStore } from "react";

export type PreviewQuality = "auto" | "low" | "medium" | "high";

export type PreviewQualityConfig = {
  /** Play videos automatically when visible */
  autoplay: boolean;
  /** <video preload="..."> */
  preload: "none" | "metadata" | "auto";
  /** Max simultaneous videos playing */
  maxConcurrent: number;
  /** Only play the currently hovered card */
  hoverOnly: boolean;
  /** Label shown in the UI */
  label: string;
};

const STORAGE_KEY = "preview-quality";

const PRESETS: Record<Exclude<PreviewQuality, "auto">, PreviewQualityConfig> = {
  low: {
    autoplay: false,
    preload: "none",
    maxConcurrent: 0,
    hoverOnly: true,
    label: "360p · pôster",
  },
  medium: {
    autoplay: false,
    preload: "metadata",
    maxConcurrent: 2,
    hoverOnly: true,
    label: "480p · hover",
  },
  high: {
    autoplay: true,
    preload: "auto",
    maxConcurrent: 4,
    hoverOnly: false,
    label: "720p · auto",
  },
};

function detectAuto(): Exclude<PreviewQuality, "auto"> {
  if (typeof navigator === "undefined") return "medium";

  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
    deviceMemory?: number;
  };
  const connection = nav.connection;

  if (connection?.saveData) return "low";

  const networkType = connection?.effectiveType;
  if (networkType === "slow-2g" || networkType === "2g") return "low";
  if (networkType === "3g") return "medium";

  // Avoid autoplaying multiple videos by default on constrained devices.
  if (
    (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) ||
    (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4)
  ) {
    return "low";
  }

  // Prefer poster-first previews unless the user explicitly selects High.
  return "medium";
}

const listeners = new Set<() => void>();
let current: PreviewQuality = "auto";

if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as PreviewQuality | null;
    if (stored === "auto" || stored === "low" || stored === "medium" || stored === "high") {
      current = stored;
    }
  } catch {
    // Storage may be unavailable in private or restricted browsing contexts.
  }
}

export function setPreviewQuality(q: PreviewQuality) {
  current = q;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, q);
    } catch {
      // Keep the in-memory preference even if storage is unavailable.
    }
  }
  listeners.forEach((listener) => listener());
}

export function usePreviewQuality(): {
  quality: PreviewQuality;
  config: PreviewQualityConfig;
  setQuality: (q: PreviewQuality) => void;
} {
  const quality = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => "medium" as PreviewQuality,
  );

  const resolved: Exclude<PreviewQuality, "auto"> =
    quality === "auto" ? detectAuto() : quality;

  return {
    quality,
    config: PRESETS[resolved],
    setQuality: setPreviewQuality,
  };
}

export function PreviewQualityOptions(): Array<{ value: PreviewQuality; label: string }> {
  return [
    { value: "auto", label: "Auto (rede)" },
    { value: "low", label: "360p · pôster" },
    { value: "medium", label: "480p · hover" },
    { value: "high", label: "720p · auto" },
  ];
}
