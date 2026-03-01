import React from "react";
import type { TraceRequest } from "../../types/trace";
import {
  formatMs,
  formatBytes,
  statusBgClass,
  methodColor,
} from "../../utils/viewport";
// import { LightningBoltIcon } from "@radix-ui/react-icons";

interface Props {
  requests: TraceRequest[];
}

export function SummaryTab({ requests }: Props) {
  const single = requests.length === 1;
  const req = requests[0];

  if (single) {
    return (
      <div className="p-3 space-y-3">
        <Section title="General">
          <Row label="URL" value={req.url} mono />
          <Row
            label="Method"
            value={req.method}
            color={methodColor(req.method)}
            mono
          />
          <Row
            label="Status"
            value={String(req.status)}
            color={statusBgClass(req.status)}
          />
          <Row label="Initiator" value={req.initiator} />
          <Row label="Cached" value={req.cached ? "Yes" : "No"} />
        </Section>
        <Section title="Timing">
          <Row label="Start" value={formatMs(req.startMs)} />
          <Row label="End" value={formatMs(req.endMs)} />
          <Row label="Duration" value={formatMs(req.duration)} />
        </Section>
        <Section title="Transfer">
          <Row label="Size" value={formatBytes(req.size)} />
        </Section>
        <Section title="Timing Breakdown">
          {Object.entries(req.timing).map(([phase, ms]) => (
            <Row
              key={phase}
              label={phase.charAt(0).toUpperCase() + phase.slice(1)}
              value={formatMs(ms)}
            />
          ))}
        </Section>
      </div>
    );
  }

  const totalDuration = requests.reduce((s, r) => s + r.duration, 0);
  const totalSize = requests.reduce((s, r) => s + r.size, 0);
  const minStart = Math.min(...requests.map((r) => r.startMs));
  const maxEnd = Math.max(...requests.map((r) => r.endMs));
  const statuses = Object.entries(
    requests.reduce<Record<string, number>>((acc, r) => {
      acc[r.statusBucket] = (acc[r.statusBucket] ?? 0) + 1;
      return acc;
    }, {}),
  );

  return (
    <div className="p-3 space-y-3">
      <Section title="Selection Summary">
        <Row label="Count" value={String(requests.length)} />
        <Row label="Total duration" value={formatMs(totalDuration)} />
        <Row label="Total size" value={formatBytes(totalSize)} />
        <Row
          label="Time span"
          value={`${formatMs(minStart)} – ${formatMs(maxEnd)}`}
        />
      </Section>
      <Section title="Status Breakdown">
        {statuses.map(([bucket, count]) => (
          <Row key={bucket} label={bucket} value={String(count)} />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="text-xs font-semibold mb-1 uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </div>
      <div
        className="rounded p-2 space-y-1"
        style={{ background: "var(--bg-base)" }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span
        className="w-24 flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className={`flex-1 break-all ${mono ? "font-mono" : ""} ${color ?? ""}`}
        style={{ color: color ? undefined : "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}
