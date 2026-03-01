type ViewportState = {
    startMs: number;
    endMs: number;
};

export function msToPx(ms: number, viewport: ViewportState, widthPx: number): number {
    const durationMs = Math.max(1, viewport.endMs - viewport.startMs);
    return ((ms - viewport.startMs) / durationMs) * widthPx;
}

export function pxToMs(px: number, viewport: ViewportState, widthPx: number): number {
    if (widthPx === 0) return viewport.startMs;
    const durationMs = viewport.endMs - viewport.startMs;
    return viewport.startMs + (px / widthPx) * durationMs;
}
