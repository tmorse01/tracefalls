import React, { useCallback } from "react";
import { Table } from "@radix-ui/themes";
import type { TraceRequest, ViewportState } from "../types/trace";
import { useStore } from "../state/store";
import {
  formatMs,
  formatBytes,
  statusBgClass,
  methodColor,
} from "../utils/viewport";
import { LightningBoltIcon } from "@radix-ui/react-icons";

interface WaterfallRowProps {
  request: TraceRequest;
  isSelected: boolean;
  viewport: ViewportState;
  columnWidths: Record<string, number>;
  onClick: (e: React.MouseEvent) => void;
}

const PHASE_COLORS: Record<string, string> = {
  dns: "var(--phase-dns)",
  connect: "var(--phase-connect)",
  ssl: "var(--phase-ssl)",
  send: "var(--phase-send)",
  wait: "var(--phase-wait)",
  receive: "var(--phase-receive)",
};

function TimingTooltip({ request }: { request: TraceRequest }) {
  const { timing, duration } = request;
  const phases = Object.entries(timing) as [string, number][];
  return (
    <div
      className="absolute z-50 left-full ml-2 top-0 rounded p-2 text-xs shadow-lg pointer-events-none whitespace-nowrap"
      style={{
        background: "var(--bg-row-hover)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    >
      <div className="font-medium mb-1">{request.name}</div>
      {phases.map(([phase, ms]) => (
        <div key={phase} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: PHASE_COLORS[phase] }}
          />
          <span
            className="capitalize w-16"
            style={{ color: "var(--text-secondary)" }}
          >
            {phase}
          </span>
          <span>{formatMs(ms)}</span>
        </div>
      ))}
      <div
        className="mt-1 pt-1 font-medium"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        Total: {formatMs(duration)}
      </div>
    </div>
  );
}

export const WaterfallTableRow = React.memo(function WaterfallTableRow({
  request,
  isSelected,
  viewport,
  columnWidths,
  onClick,
}: WaterfallRowProps) {
  const { dispatch } = useStore();
  const [isHovered, setIsHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const tooltipTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelineRef = React.useRef<HTMLTableCellElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    dispatch({ type: "SET_HOVER_MS", ms: request.startMs });
    tooltipTimer.current = setTimeout(() => setShowTooltip(true), 400);
  }, [dispatch, request.startMs]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    dispatch({ type: "SET_HOVER_MS", ms: null });
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setShowTooltip(false);
  }, [dispatch]);

  const windowMs = viewport.endMs - viewport.startMs;
  const barLeft =
    windowMs > 0 ? ((request.startMs - viewport.startMs) / windowMs) * 100 : 0;
  const barWidth = windowMs > 0 ? (request.duration / windowMs) * 100 : 0;

  const phases = [
    { key: "dns", ms: request.timing.dns },
    { key: "connect", ms: request.timing.connect },
    { key: "ssl", ms: request.timing.ssl },
    { key: "send", ms: request.timing.send },
    { key: "wait", ms: request.timing.wait },
    { key: "receive", ms: request.timing.receive },
  ].filter((p) => p.ms > 0);

  const bgColor = isSelected
    ? "var(--bg-row-selected)"
    : isHovered
      ? "var(--bg-row-hover)"
      : "transparent";

  return (
    <Table.Row
      className="border-b cursor-pointer"
      style={{
        height: 28,
        background: bgColor,
        borderColor: "var(--border)",
        transition: "background 0.05s",
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-selected={isSelected}
    >
      {/* Method column */}
      <Table.Cell
        style={{
          width: `${columnWidths.method || 50}px`,
          height: 28,
          padding: "0 8px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <span
          className={`text-xs font-mono font-semibold ${methodColor(request.method)}`}
        >
          {request.method.slice(0, 4)}
        </span>
      </Table.Cell>

      {/* Name column */}
      <Table.Cell
        style={{
          width: `${columnWidths.name || 280}px`,
          height: 28,
          padding: "0 8px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          gap: "4px",
        }}
      >
        {request.cached && (
          <LightningBoltIcon
            width={18}
            height={18}
            style={{ color: "var(--accent-blue)", flexShrink: 0 }}
          />
        )}
        <span
          className="text-xs truncate"
          style={{ color: "var(--text-primary)" }}
          title={request.name}
        >
          {request.name}
        </span>
      </Table.Cell>

      {/* Status column */}
      <Table.Cell
        style={{
          width: `${columnWidths.status || 50}px`,
          height: 28,
          padding: "0 8px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        <span className={`text-xs ${statusBgClass(request.status)}`}>
          {request.status}
        </span>
      </Table.Cell>

      {/* Time column */}
      <Table.Cell
        style={{
          width: `${columnWidths.time || 60}px`,
          height: 28,
          padding: "0 8px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          overflow: "hidden",
          color: "var(--text-secondary)",
        }}
      >
        <span className="text-xs">{formatMs(request.duration)}</span>
      </Table.Cell>

      {/* Size column */}
      <Table.Cell
        style={{
          width: `${columnWidths.size || 60}px`,
          height: 28,
          padding: "0 8px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          overflow: "hidden",
          color: "var(--text-muted)",
        }}
      >
        <span className="text-xs">{formatBytes(request.size)}</span>
      </Table.Cell>

      {/* Timeline bar area */}
      <Table.Cell
        ref={timelineRef}
        style={{
          height: 28,
          padding: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-sm flex overflow-hidden"
          style={{
            left: `${Math.max(0, barLeft)}%`,
            width: `${Math.max(0.1, barWidth)}%`,
            height: 12,
          }}
        >
          {phases.map((p) => (
            <div
              key={p.key}
              style={{
                width: `${(p.ms / request.duration) * 100}%`,
                background: PHASE_COLORS[p.key],
                minWidth: 1,
              }}
            />
          ))}
        </div>

        {/* Tooltip */}
        {showTooltip && <TimingTooltip request={request} />}
      </Table.Cell>
    </Table.Row>
  );
});
