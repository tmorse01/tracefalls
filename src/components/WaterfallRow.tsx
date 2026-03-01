import React, { useCallback, useRef } from "react";
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
  leftColWidth: number;
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
            className="w-2 h-2 rounded-full flex-shrink-0"
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

export const WaterfallRow = React.memo(function WaterfallRow({
  request,
  isSelected,
  viewport,
  leftColWidth,
  onClick,
}: WaterfallRowProps) {
  const { dispatch } = useStore();
  const rowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const timelineRef = useRef<HTMLDivElement>(null);

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
    <div
      ref={rowRef}
      className="flex items-center cursor-pointer border-b relative"
      style={{
        height: 28,
        background: bgColor,
        borderColor: "var(--border)",
        transition: "background 0.05s",
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="row"
      aria-selected={isSelected}
    >
      {/* Left column */}
      <div
        className="flex items-center gap-2 px-2 flex-shrink-0 overflow-hidden"
        style={{ width: leftColWidth, borderRight: "1px solid var(--border)" }}
      >
        <span
          className={`text-xs font-mono font-semibold w-10 flex-shrink-0 ${methodColor(request.method)}`}
        >
          {request.method.slice(0, 4)}
        </span>
        <span
          className="flex-1 text-xs truncate flex items-center gap-1"
          style={{ color: "var(--text-primary)" }}
          title={request.name}
        >
          {request.cached && (
            <LightningBoltIcon
              width={18}
              height={18}
              style={{ color: "var(--accent-blue)", flexShrink: 0 }}
            />
          )}
          <span className="truncate">{request.name}</span>
        </span>
        <span
          className={`text-xs w-12 text-right flex-shrink-0 ${statusBgClass(request.status)}`}
        >
          {request.status}
        </span>
        <span
          className="text-xs w-12 text-right flex-shrink-0"
          style={{ color: "var(--text-secondary)" }}
        >
          {formatMs(request.duration)}
        </span>
        <span
          className="text-xs w-12 text-right flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          {formatBytes(request.size)}
        </span>
      </div>

      {/* Timeline bar area */}
      <div ref={timelineRef} className="flex-1 relative overflow-hidden h-full">
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
      </div>
    </div>
  );
});
