import React, { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../state/store';
import { statusColor } from '../utils/viewport';

const MINIMAP_HEIGHT = 40;

export function Minimap() {
  const { state, dispatch } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dragging: boolean; startX: number; startViewport: { startMs: number; endMs: number } }>({
    dragging: false, startX: 0, startViewport: { startMs: 0, endMs: 0 },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = container.clientWidth;
    const H = MINIMAP_HEIGHT;
    canvas.width = W;
    canvas.height = H;

    const { requests, viewport } = state;
    const total = viewport.totalMs || 1;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#181b22';
    ctx.fillRect(0, 0, W, H);

    for (const req of requests) {
      const x = (req.startMs / total) * W;
      const w = Math.max(1, ((req.endMs - req.startMs) / total) * W);
      ctx.fillStyle = statusColor(req.status) + '99';
      ctx.fillRect(x, H * 0.25, w, H * 0.5);
    }

    const winX = (viewport.startMs / total) * W;
    const winW = Math.max(2, ((viewport.endMs - viewport.startMs) / total) * W);
    ctx.fillStyle = 'rgba(79, 142, 247, 0.12)';
    ctx.fillRect(winX, 0, winW, H);
    ctx.strokeStyle = '#4f8ef7';
    ctx.lineWidth = 1;
    ctx.strokeRect(winX, 0, winW, H);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.requests, state.viewport]);

  const getMs = useCallback((clientX: number): number => {
    const container = containerRef.current;
    if (!container) return 0;
    const rect = container.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return ratio * state.viewport.totalMs;
  }, [state.viewport.totalMs]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const clickMs = getMs(e.clientX);
    const { startMs, endMs } = state.viewport;
    const windowMs = endMs - startMs;
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startViewport: { startMs, endMs },
    };
    const inWindow = clickMs >= startMs && clickMs <= endMs;
    if (!inWindow) {
      const newStart = Math.max(0, clickMs - windowMs / 2);
      dispatch({ type: 'SET_VIEWPORT', viewport: { startMs: newStart, endMs: newStart + windowMs } });
    }
    dispatch({ type: 'SET_IS_DRAGGING', value: true });
  }, [state.viewport, dispatch, getMs]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current.dragging) return;
    const container = containerRef.current;
    if (!container) return;
    const { totalMs } = state.viewport;
    const rect = container.getBoundingClientRect();
    const deltaRatio = (e.clientX - dragRef.current.startX) / rect.width;
    const deltaMs = deltaRatio * totalMs;
    const { startMs, endMs } = dragRef.current.startViewport;
    const windowMs = endMs - startMs;
    let newStart = startMs + deltaMs;
    if (newStart < 0) newStart = 0;
    if (newStart + windowMs > totalMs) newStart = totalMs - windowMs;
    dispatch({ type: 'SET_VIEWPORT', viewport: { startMs: Math.round(newStart), endMs: Math.round(newStart + windowMs) } });
  }, [state.viewport, dispatch]);

  const handleMouseUp = useCallback(() => {
    dragRef.current.dragging = false;
    dispatch({ type: 'SET_IS_DRAGGING', value: false });
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-ew-resize select-none border-b"
      style={{ height: MINIMAP_HEIGHT, background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      onMouseDown={handleMouseDown}
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  );
}
