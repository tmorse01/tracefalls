import type { ViewportState } from "../types/trace";

export function msToPx(
  ms: number,
  viewport: ViewportState,
  widthPx: number,
): number {
  const windowMs = viewport.endMs - viewport.startMs;
  if (windowMs <= 0) return 0;
  return ((ms - viewport.startMs) / windowMs) * widthPx;
}

export function pxToMs(
  px: number,
  viewport: ViewportState,
  widthPx: number,
): number {
  const windowMs = viewport.endMs - viewport.startMs;
  if (widthPx <= 0) return viewport.startMs;
  return viewport.startMs + (px / widthPx) * windowMs;
}

export function formatMs(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Resolve a CSS custom property to its computed value (for canvas use). */
export function resolveVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/** Returns a CSS variable reference — use in inline styles, NOT canvas. */
export function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "var(--status-2xx)";
  if (status >= 300 && status < 400) return "var(--status-3xx)";
  if (status >= 400 && status < 500) return "var(--status-4xx)";
  if (status >= 500) return "var(--status-5xx)";
  return "var(--status-other)";
}

export function statusBgClass(status: number): string {
  if (status >= 200 && status < 300) return "text-[var(--status-2xx)]";
  if (status >= 300 && status < 400) return "text-[var(--status-3xx)]";
  if (status >= 400 && status < 500) return "text-[var(--status-4xx)]";
  if (status >= 500) return "text-[var(--status-5xx)]";
  return "text-[var(--status-other)]";
}

export function methodColor(method: string): string {
  switch (method) {
    case "GET":
      return "text-[var(--method-get)]";
    case "POST":
      return "text-[var(--method-post)]";
    case "PUT":
      return "text-[var(--method-put)]";
    case "DELETE":
      return "text-[var(--method-delete)]";
    case "PATCH":
      return "text-[var(--method-patch)]";
    default:
      return "text-[var(--method-default)]";
  }
}
