import { useEffect, useState, useSyncExternalStore } from "react";

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
    maxConcurrent: 8,
    hoverOnly: false,
    label: "720p · auto",
  },
};

function detectAuto(): Exclude<PreviewQuality, "auto"> {
  if (typeof navigator === "undefined") return "high";
  const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (conn?.saveData) return "low";
  const t = conn?.effectiveType;
  if (t === "slow-2g" || t === "2g") return "low";
  if (t === "3g") return "medium";
  return "high";
}

const listeners = new Set<() => void>();
let current: PreviewQuality = "auto";

if (typeof window !== "undefined") {
  const stored = window.localStorage.getItem(STORAGE_KEY) as PreviewQuality | null;
  if (stored === "auto" || stored === "low" || stored === "medium" || stored === "high") {
    current = stored;
  }
}

export function setPreviewQuality(q: PreviewQuality) {
  current = q;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, q);
  }
  listeners.forEach((l) => l());
}

export function usePreviewQuality(): {
  quality: PreviewQuality;
  config: PreviewQualityConfig;
  setQuality: (q: PreviewQuality) => void;
} {
  const quality = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "high" as PreviewQuality // Default high during SSR
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