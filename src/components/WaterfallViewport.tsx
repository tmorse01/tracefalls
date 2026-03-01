import React, { useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStore, useFilteredSortedRequests } from '../state/store';
import { WaterfallRow } from './WaterfallRow';
import { formatMs } from '../utils/viewport';

const ROW_HEIGHT = 28;
const LEFT_COL_WIDTH = 380;
const TICK_COUNT = 8;

export function WaterfallViewport() {
  const { state, dispatch } = useStore();
  const filteredRows = useFilteredSortedRequests();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const { viewport } = state;
  const windowMs = viewport.endMs - viewport.startMs;

  const ticks = useMemo(() => {
    const result: { ms: number; label: string }[] = [];
    for (let i = 0; i <= TICK_COUNT; i++) {
      const ms = viewport.startMs + (i / TICK_COUNT) * windowMs;
      result.push({ ms, label: formatMs(ms) });
    }
    return result;
  }, [viewport, windowMs]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const px = e.clientX - rect.left - LEFT_COL_WIDTH;
      const W = rect.width - LEFT_COL_WIDTH;
      if (W <= 0) return;
      const centerMs = viewport.startMs + (px / W) * windowMs;
      const factor = e.deltaY < 0 ? 1.3 : 1 / 1.3;
      dispatch({ type: 'ZOOM_VIEWPORT', factor, centerMs });
    } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      const W = (e.currentTarget as HTMLElement).getBoundingClientRect().width - LEFT_COL_WIDTH;
      if (W <= 0) return;
      const deltaMs = (e.deltaX / W) * windowMs;
      dispatch({ type: 'PAN_VIEWPORT', deltaMs });
    }
  }, [viewport, windowMs, dispatch]);

  const handleRowClick = useCallback((id: string, e: React.MouseEvent) => {
    if (e.shiftKey && state.selection.length > 0) {
      const lastId = state.selection[state.selection.length - 1];
      const lastIdx = filteredRows.findIndex(r => r.id === lastId);
      const thisIdx = filteredRows.findIndex(r => r.id === id);
      if (lastIdx >= 0 && thisIdx >= 0) {
        const [from, to] = [Math.min(lastIdx, thisIdx), Math.max(lastIdx, thisIdx)];
        dispatch({ type: 'SELECT_RANGE', ids: filteredRows.slice(from, to + 1).map(r => r.id) });
        return;
      }
    }
    if (e.ctrlKey || e.metaKey) {
      dispatch({ type: 'TOGGLE_SELECT', id });
    } else {
      dispatch({ type: 'SELECT_SINGLE', id });
    }
  }, [state.selection, filteredRows, dispatch]);

  const dragRef = useRef<{ active: boolean; startX: number; startMs: number; endMs: number }>({
    active: false, startX: 0, startMs: 0, endMs: 0,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 1 && !e.altKey) return;
    e.preventDefault();
    dragRef.current = { active: true, startX: e.clientX, startMs: viewport.startMs, endMs: viewport.endMs };
    dispatch({ type: 'SET_IS_DRAGGING', value: true });
  }, [viewport, dispatch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.active) return;
    const W = (e.currentTarget as HTMLElement).getBoundingClientRect().width - LEFT_COL_WIDTH;
    if (W <= 0) return;
    const deltaMs = -((e.clientX - dragRef.current.startX) / W) * windowMs;
    const { startMs: origStart, endMs: origEnd } = dragRef.current;
    const wMs = origEnd - origStart;
    let newStart = origStart + deltaMs;
    if (newStart < 0) newStart = 0;
    if (newStart + wMs > viewport.totalMs) newStart = viewport.totalMs - wMs;
    dispatch({ type: 'SET_VIEWPORT', viewport: { startMs: Math.round(newStart), endMs: Math.round(newStart + wMs) } });
  }, [viewport.totalMs, windowMs, dispatch]);

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false;
    dispatch({ type: 'SET_IS_DRAGGING', value: false });
  }, [dispatch]);

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'SET_HOVER_MS', ms: null });
  }, [dispatch]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 overflow-hidden select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Timeline axis header */}
      <div
        className="flex flex-shrink-0 border-b text-xs"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', height: 24 }}
      >
        <div className="flex flex-shrink-0 items-center px-2 gap-2" style={{ width: LEFT_COL_WIDTH, borderRight: '1px solid var(--border)' }}>
          <span className="w-10" style={{ color: 'var(--text-muted)' }}>Method</span>
          <span className="flex-1" style={{ color: 'var(--text-muted)' }}>Name</span>
          <span className="w-12 text-right" style={{ color: 'var(--text-muted)' }}>Status</span>
          <span className="w-12 text-right" style={{ color: 'var(--text-muted)' }}>Time</span>
          <span className="w-12 text-right" style={{ color: 'var(--text-muted)' }}>Size</span>
        </div>
        <div className="flex-1 relative overflow-hidden">
          {ticks.map((t, i) => (
            <div
              key={i}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${(i / TICK_COUNT) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: 10, paddingTop: 4 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual rows */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ contain: 'strict' }}
      >
        {filteredRows.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-muted)' }}>
            No requests match the current filters.
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
            {virtualizer.getVirtualItems().map(virtualRow => {
              const req = filteredRows[virtualRow.index];
              const isSelected = state.selection.includes(req.id);
              return (
                <div
                  key={req.id}
                  style={{
                    position: 'absolute',
                    top: virtualRow.start,
                    width: '100%',
                    height: ROW_HEIGHT,
                  }}
                >
                  <WaterfallRow
                    request={req}
                    isSelected={isSelected}
                    viewport={viewport}
                    leftColWidth={LEFT_COL_WIDTH}
                    onClick={e => handleRowClick(req.id, e)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
