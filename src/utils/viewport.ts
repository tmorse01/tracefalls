import type { ViewportState } from '../types/trace';

export function msToPx(ms: number, viewport: ViewportState, widthPx: number): number {
  const windowMs = viewport.endMs - viewport.startMs;
  if (windowMs <= 0) return 0;
  return ((ms - viewport.startMs) / windowMs) * widthPx;
}

export function pxToMs(px: number, viewport: ViewportState, widthPx: number): number {
  const windowMs = viewport.endMs - viewport.startMs;
  if (widthPx <= 0) return viewport.startMs;
  return viewport.startMs + (px / widthPx) * windowMs;
}

export function formatMs(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'var(--status-2xx)';
  if (status >= 300 && status < 400) return 'var(--status-3xx)';
  if (status >= 400 && status < 500) return 'var(--status-4xx)';
  if (status >= 500) return 'var(--status-5xx)';
  return 'var(--status-other)';
}

export function statusBgClass(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-400';
  if (status >= 300 && status < 400) return 'text-blue-400';
  if (status >= 400 && status < 500) return 'text-red-400';
  if (status >= 500) return 'text-orange-400';
  return 'text-purple-400';
}

export function methodColor(method: string): string {
  switch (method) {
    case 'GET':    return 'text-blue-400';
    case 'POST':   return 'text-green-400';
    case 'PUT':    return 'text-yellow-400';
    case 'DELETE': return 'text-red-400';
    case 'PATCH':  return 'text-purple-400';
    default:       return 'text-gray-400';
  }
}
