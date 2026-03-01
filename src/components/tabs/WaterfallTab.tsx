import type { TraceRequest } from "../../types/trace";
import { formatMs } from "../../utils/viewport";

interface Props {
  request: TraceRequest;
}

const PHASES = [
  { key: "dns", label: "DNS Lookup", color: "var(--phase-dns)" },
  {
    key: "connect",
    label: "Initial Connection",
    color: "var(--phase-connect)",
  },
  { key: "ssl", label: "SSL Handshake", color: "var(--phase-ssl)" },
  { key: "send", label: "Request Sent", color: "var(--phase-send)" },
  { key: "wait", label: "Waiting (TTFB)", color: "var(--phase-wait)" },
  { key: "receive", label: "Content Download", color: "var(--phase-receive)" },
] as const;

export function WaterfallTab({ request }: Props) {
  const { timing, duration } = request;

  // Compute cumulative offsets using reduce (no mutable variables)
  const phasesWithOffsets = PHASES.reduce<
    Array<{
      key: string;
      label: string;
      color: string;
      ms: number;
      startPercent: number;
      widthPercent: number;
    }>
  >((acc, phase) => {
    const ms = timing[phase.key];
    const offset = acc.reduce((s, p) => s + p.ms, 0);
    const startPercent = duration > 0 ? (offset / duration) * 100 : 0;
    const widthPercent = duration > 0 ? (ms / duration) * 100 : 0;
    return [...acc, { ...phase, ms, startPercent, widthPercent }];
  }, []);

  return (
    <div className="p-3 space-y-3">
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        Timing Breakdown
      </div>
      <div className="space-y-1.5">
        {phasesWithOffsets.map((phase) => {
          const { ms, startPercent, widthPercent } = phase;
          return (
            <div key={phase.key} className="flex items-center gap-2 text-xs">
              <span
                className="w-32 text-right flex-shrink-0"
                style={{ color: "var(--text-secondary)" }}
              >
                {phase.label}
              </span>
              <div
                className="flex-1 relative h-4 rounded overflow-hidden"
                style={{ background: "var(--bg-base)" }}
              >
                {ms > 0 && (
                  <div
                    className="absolute top-0 h-full rounded"
                    style={{
                      left: `${startPercent}%`,
                      width: `${Math.max(0.5, widthPercent)}%`,
                      background: phase.color,
                    }}
                  />
                )}
              </div>
              <span
                className="w-12 text-right flex-shrink-0"
                style={{
                  color: ms > 0 ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {formatMs(ms)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div
        className="flex items-center gap-2 text-xs font-semibold pt-2"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span
          className="w-32 text-right"
          style={{ color: "var(--text-secondary)" }}
        >
          Total
        </span>
        <div className="flex-1" />
        <span
          className="w-12 text-right"
          style={{ color: "var(--text-primary)" }}
        >
          {formatMs(duration)}
        </span>
      </div>
    </div>
  );
}
