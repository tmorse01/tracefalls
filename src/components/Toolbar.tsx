import React from "react";
import { useStore } from "../state/store";
import { SCENARIOS } from "../data/scenarios";
import type { SortKey, StatusBucket } from "../types/trace";
import * as Select from "@radix-ui/react-select";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Toggle from "@radix-ui/react-toggle";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@radix-ui/react-icons";

const STATUS_BUCKETS: StatusBucket[] = ["2xx", "3xx", "4xx", "5xx"];
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "startMs", label: "Start Time" },
  { value: "duration", label: "Duration" },
  { value: "size", label: "Size" },
  { value: "status", label: "Status" },
  { value: "name", label: "Name" },
];

const STATUS_COLORS: Record<StatusBucket, string> = {
  "2xx": "var(--status-2xx)",
  "3xx": "var(--status-3xx)",
  "4xx": "var(--status-4xx)",
  "5xx": "var(--status-5xx)",
  pending: "var(--status-other)",
};
const METHOD_TEXT_COLORS: Record<string, string> = {
  GET: "var(--method-get)",
  POST: "var(--method-post)",
  PUT: "var(--method-put)",
  DELETE: "var(--method-delete)",
  PATCH: "var(--method-patch)",
};

interface ToolbarProps {
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export function Toolbar({ searchRef }: ToolbarProps) {
  const { state, dispatch } = useStore();
  const { filters, sort } = state;

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-3 py-2 border-b text-sm"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Scenario selector */}
      <Select.Root
        value={state.scenario.id}
        onValueChange={(value) =>
          dispatch({ type: "SET_SCENARIO", scenarioId: value })
        }
      >
        <Select.Trigger
          className="rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:ring-1 flex items-center justify-between gap-1"
          style={{
            background: "var(--bg-base)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          aria-label="Scenario"
        >
          <Select.Value />
          <Select.Icon asChild>
            <ChevronDownIcon width={16} height={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="rounded shadow-lg overflow-hidden"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
            }}
          >
            <Select.Viewport className="p-1">
              {SCENARIOS.map((s) => (
                <Select.Item
                  key={s.id}
                  value={s.id}
                  className="px-2 py-1.5 text-xs cursor-pointer rounded focus:outline-none focus:ring-1 flex items-center justify-between gap-2 hover:opacity-80"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  <Select.ItemText>
                    {s.label} ({s.requestCount})
                  </Select.ItemText>
                  <Select.ItemIndicator asChild>
                    <CheckIcon width={14} height={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <div className="h-4 w-px" style={{ background: "var(--border)" }} />

      {/* Search */}
      <input
        ref={searchRef}
        type="search"
        placeholder="Filter (f)"
        value={filters.text}
        onChange={(e) =>
          dispatch({ type: "SET_FILTER_TEXT", text: e.target.value })
        }
        className="rounded px-2 py-1 text-xs w-44 focus:outline-none focus:ring-1"
        style={{
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
        aria-label="Filter requests"
      />

      <div className="h-4 w-px" style={{ background: "var(--border)" }} />

      {/* Status buckets */}
      <ToggleGroup.Root
        type="multiple"
        value={filters.statusBuckets}
        onValueChange={(values) => {
          const added = values.find(
            (v) => !filters.statusBuckets.includes(v as StatusBucket),
          );
          const removed = filters.statusBuckets.find(
            (v) => !values.includes(v),
          );
          if (added) {
            dispatch({
              type: "TOGGLE_STATUS_BUCKET",
              bucket: added as StatusBucket,
            });
          } else if (removed) {
            dispatch({ type: "TOGGLE_STATUS_BUCKET", bucket: removed });
          }
        }}
        className="flex gap-1"
        aria-label="Status filter"
      >
        {STATUS_BUCKETS.map((b) => (
          <ToggleGroup.Item
            key={b}
            value={b}
            className="px-2 py-0.5 rounded text-xs font-medium transition-colors data-[state=on]:opacity-100 opacity-60 hover:opacity-80"
            style={{
              background: filters.statusBuckets.includes(b)
                ? STATUS_COLORS[b] + "33"
                : "transparent",
              color: STATUS_COLORS[b],
              border: `1px solid ${
                filters.statusBuckets.includes(b)
                  ? STATUS_COLORS[b]
                  : "transparent"
              }`,
            }}
            aria-label={`Filter by ${b}`}
          >
            {b}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <div className="h-4 w-px" style={{ background: "var(--border)" }} />

      {/* Method filters */}
      <ToggleGroup.Root
        type="multiple"
        value={filters.methods}
        onValueChange={(values) => {
          const added = values.find((v) => !filters.methods.includes(v));
          const removed = filters.methods.find((v) => !values.includes(v));
          if (added) {
            dispatch({ type: "TOGGLE_METHOD", method: added });
          } else if (removed) {
            dispatch({ type: "TOGGLE_METHOD", method: removed });
          }
        }}
        className="flex gap-1"
        aria-label="Method filter"
      >
        {METHODS.map((m) => (
          <ToggleGroup.Item
            key={m}
            value={m}
            className="px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors data-[state=on]:opacity-100 opacity-60 hover:opacity-80"
            style={{
              background: filters.methods.includes(m)
                ? METHOD_TEXT_COLORS[m] + "22"
                : "transparent",
              color: METHOD_TEXT_COLORS[m],
              border: `1px solid ${
                filters.methods.includes(m)
                  ? METHOD_TEXT_COLORS[m]
                  : "transparent"
              }`,
            }}
            aria-label={`Filter by ${m}`}
          >
            {m}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <div className="h-4 w-px" style={{ background: "var(--border)" }} />

      {/* Hide cached */}
      <div className="flex items-center gap-1.5 text-xs">
        <Checkbox.Root
          checked={filters.hideCached}
          onCheckedChange={(checked) =>
            dispatch({ type: "SET_HIDE_CACHED", value: !!checked })
          }
          className="w-4 h-4 rounded border cursor-pointer focus:outline-none focus:ring-1 flex items-center justify-center"
          style={{
            background: filters.hideCached
              ? "var(--accent-blue)"
              : "transparent",
            color: "white",
            borderColor: "var(--border)",
          }}
          aria-label="Hide cached"
        >
          <Checkbox.Indicator className="flex items-center justify-center">
            <CheckIcon width={12} height={12} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label
          className="cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
        >
          Hide cached
        </label>
      </div>

      <div className="h-4 w-px" style={{ background: "var(--border)" }} />

      {/* Sort */}
      <div className="flex items-center gap-1">
        <span style={{ color: "var(--text-muted)" }} className="text-xs">
          Sort:
        </span>
        <Select.Root
          value={sort.key}
          onValueChange={(value) =>
            dispatch({
              type: "SET_SORT",
              key: value as SortKey,
              direction: sort.direction,
            })
          }
        >
          <Select.Trigger
            className="rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:ring-1 flex items-center justify-between gap-1"
            style={{
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            aria-label="Sort by"
          >
            <Select.Value />
            <Select.Icon asChild>
              <ChevronDownIcon width={14} height={14} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              className="rounded shadow-lg overflow-hidden"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
              }}
            >
              <Select.Viewport className="p-1">
                {SORT_OPTIONS.map((o) => (
                  <Select.Item
                    key={o.value}
                    value={o.value}
                    className="px-2 py-1.5 text-xs cursor-pointer rounded focus:outline-none focus:ring-1 flex items-center justify-between gap-2 hover:opacity-80"
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    <Select.ItemText>{o.label}</Select.ItemText>
                    <Select.ItemIndicator asChild>
                      <CheckIcon width={14} height={14} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        <Toggle.Root
          pressed={sort.direction === "desc"}
          onPressedChange={() =>
            dispatch({
              type: "SET_SORT",
              key: sort.key,
              direction: sort.direction === "asc" ? "desc" : "asc",
            })
          }
          className="rounded flex items-center justify-center w-7 h-7 focus:outline-none focus:ring-1 transition-colors data-[state=on]:opacity-100 opacity-60 hover:opacity-80"
          style={{
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
          aria-label={`Sort direction: ${sort.direction}`}
        >
          {sort.direction === "asc" ? (
            <ArrowUpIcon width={14} height={14} />
          ) : (
            <ArrowDownIcon width={14} height={14} />
          )}
        </Toggle.Root>
      </div>

      {/* Zoom controls */}
      <div className="flex gap-1 ml-auto">
        <Toggle.Root
          onClick={() => dispatch({ type: "ZOOM_VIEWPORT", factor: 1.5 })}
          className="rounded flex items-center justify-center w-7 h-7 focus:outline-none focus:ring-1 transition-colors opacity-60 hover:opacity-80"
          style={{
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
          title="Zoom in (+ key)"
          aria-label="Zoom in"
        >
          <ZoomInIcon width={14} height={14} />
        </Toggle.Root>
        <Toggle.Root
          onClick={() => dispatch({ type: "ZOOM_VIEWPORT", factor: 1 / 1.5 })}
          className="rounded flex items-center justify-center w-7 h-7 focus:outline-none focus:ring-1 transition-colors opacity-60 hover:opacity-80"
          style={{
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
          title="Zoom out (- key)"
          aria-label="Zoom out"
        >
          <ZoomOutIcon width={14} height={14} />
        </Toggle.Root>
      </div>

      {/* Row count */}
      <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
        {state.requests.length} requests
      </span>
    </div>
  );
}
