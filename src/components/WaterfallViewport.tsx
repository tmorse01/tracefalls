import React, { useRef, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table } from "@radix-ui/themes";
import { useStore, useFilteredSortedRequests } from "../state/store";
import { WaterfallTableRow } from "./WaterfallTableRow";
import { TableHeader, type ColumnDef } from "./TableHeader";
import { formatMs } from "../utils/viewport";

const ROW_HEIGHT = 28;

const COLUMNS: ColumnDef[] = [
  { key: "method", label: "Method", minWidth: 40, maxWidth: 80, width: 50 },
  { key: "name", label: "Name", minWidth: 200, maxWidth: 600, width: 280 },
  { key: "status", label: "Status", minWidth: 45, maxWidth: 80, width: 50 },
  { key: "time", label: "Time", minWidth: 50, maxWidth: 100, width: 60 },
  { key: "size", label: "Size", minWidth: 50, maxWidth: 100, width: 60 },
];

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

  const { viewport, ui } = state;
  const columnWidths = ui.columnWidths;
  const windowMs = viewport.endMs - viewport.startMs;

  const leftColsWidth = useMemo(() => {
    return COLUMNS.reduce(
      (sum, col) => sum + (columnWidths[col.key] || col.width),
      0,
    );
  }, [columnWidths]);

  const ticks = useMemo(() => {
    const result: { ms: number; label: string }[] = [];
    for (let i = 0; i <= TICK_COUNT; i++) {
      const ms = viewport.startMs + (i / TICK_COUNT) * windowMs;
      result.push({ ms, label: formatMs(ms) });
    }
    return result;
  }, [viewport, windowMs]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const px = e.clientX - rect.left - leftColsWidth;
        const W = rect.width - leftColsWidth;
        if (W <= 0) return;
        const centerMs = viewport.startMs + (px / W) * windowMs;
        const factor = e.deltaY < 0 ? 1.3 : 1 / 1.3;
        dispatch({ type: "ZOOM_VIEWPORT", factor, centerMs });
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const W =
          (e.currentTarget as HTMLElement).getBoundingClientRect().width -
          leftColsWidth;
        if (W <= 0) return;
        const deltaMs = (e.deltaX / W) * windowMs;
        dispatch({ type: "PAN_VIEWPORT", deltaMs });
      }
    },
    [viewport, windowMs, leftColsWidth, dispatch],
  );

  const handleRowClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (e.shiftKey && state.selection.length > 0) {
        const lastId = state.selection[state.selection.length - 1];
        const lastIdx = filteredRows.findIndex((r) => r.id === lastId);
        const thisIdx = filteredRows.findIndex((r) => r.id === id);
        if (lastIdx >= 0 && thisIdx >= 0) {
          const [from, to] = [
            Math.min(lastIdx, thisIdx),
            Math.max(lastIdx, thisIdx),
          ];
          dispatch({
            type: "SELECT_RANGE",
            ids: filteredRows.slice(from, to + 1).map((r) => r.id),
          });
          return;
        }
      }
      if (e.ctrlKey || e.metaKey) {
        dispatch({ type: "TOGGLE_SELECT", id });
      } else {
        dispatch({ type: "SELECT_SINGLE", id });
      }
    },
    [state.selection, filteredRows, dispatch],
  );

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startMs: number;
    endMs: number;
  }>({
    active: false,
    startX: 0,
    startMs: 0,
    endMs: 0,
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 1 && !e.altKey) return;
      e.preventDefault();
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startMs: viewport.startMs,
        endMs: viewport.endMs,
      };
      dispatch({ type: "SET_IS_DRAGGING", value: true });
    },
    [viewport, dispatch],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current.active) return;
      const W =
        (e.currentTarget as HTMLElement).getBoundingClientRect().width -
        leftColsWidth;
      if (W <= 0) return;
      const deltaMs = -((e.clientX - dragRef.current.startX) / W) * windowMs;
      const { startMs: origStart, endMs: origEnd } = dragRef.current;
      const wMs = origEnd - origStart;
      let newStart = origStart + deltaMs;
      if (newStart < 0) newStart = 0;
      if (newStart + wMs > viewport.totalMs) newStart = viewport.totalMs - wMs;
      dispatch({
        type: "SET_VIEWPORT",
        viewport: {
          startMs: Math.round(newStart),
          endMs: Math.round(newStart + wMs),
        },
      });
    },
    [viewport.totalMs, windowMs, leftColsWidth, dispatch],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false;
    dispatch({ type: "SET_IS_DRAGGING", value: false });
  }, [dispatch]);

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: "SET_HOVER_MS", ms: null });
  }, [dispatch]);

  const handleColumnWidthsChange = useCallback(
    (widths: Record<string, number>) => {
      dispatch({ type: "SET_COLUMN_WIDTHS", widths });
    },
    [dispatch],
  );

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
      {/* Table Header with column definitions and timeline ticks */}
      <TableHeader
        columns={COLUMNS}
        columnWidths={columnWidths}
        onColumnWidthsChange={handleColumnWidthsChange}
        ticks={ticks}
      />

      {/* Virtual table body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ contain: "strict" }}
      >
        {filteredRows.length === 0 ? (
          <div
            className="flex items-center justify-center h-32 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            No requests match the current filters.
          </div>
        ) : (
          <Table.Root layout="fixed" role="presentation">
            <Table.Body>
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: "relative",
                  width: "100%",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const req = filteredRows[virtualRow.index];
                  const isSelected = state.selection.includes(req.id);
                  return (
                    <div
                      key={req.id}
                      style={{
                        position: "absolute",
                        top: virtualRow.start,
                        width: "100%",
                        height: ROW_HEIGHT,
                      }}
                    >
                      <Table.Root layout="fixed" role="presentation">
                        <Table.Body>
                          <WaterfallTableRow
                            request={req}
                            isSelected={isSelected}
                            viewport={viewport}
                            columnWidths={columnWidths}
                            onClick={(e) => handleRowClick(req.id, e)}
                          />
                        </Table.Body>
                      </Table.Root>
                    </div>
                  );
                })}
              </div>
            </Table.Body>
          </Table.Root>
        )}
      </div>
    </div>
  );
}
