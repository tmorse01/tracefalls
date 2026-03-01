import React from 'react';
import { useStore } from '../state/store';
import { SCENARIOS } from '../data/scenarios';
import type { SortKey, StatusBucket } from '../types/trace';

const STATUS_BUCKETS: StatusBucket[] = ['2xx', '3xx', '4xx', '5xx'];
const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'startMs',  label: 'Start Time' },
  { value: 'duration', label: 'Duration' },
  { value: 'size',     label: 'Size' },
  { value: 'status',   label: 'Status' },
  { value: 'name',     label: 'Name' },
];

const STATUS_COLORS: Record<StatusBucket, string> = {
  '2xx': '#34d399', '3xx': '#60a5fa', '4xx': '#f87171', '5xx': '#fb923c', pending: '#a78bfa',
};
const METHOD_TEXT_COLORS: Record<string, string> = {
  GET: '#60a5fa', POST: '#34d399', PUT: '#fbbf24', DELETE: '#f87171', PATCH: '#a78bfa',
};

interface ToolbarProps {
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export function Toolbar({ searchRef }: ToolbarProps) {
  const { state, dispatch } = useStore();
  const { filters, sort } = state;

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b text-sm" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      {/* Scenario selector */}
      <select
        value={state.scenario.id}
        onChange={e => dispatch({ type: 'SET_SCENARIO', scenarioId: e.target.value })}
        className="rounded px-2 py-1 text-xs cursor-pointer focus:outline-none"
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        aria-label="Scenario"
      >
        {SCENARIOS.map(s => (
          <option key={s.id} value={s.id}>{s.label} ({s.requestCount})</option>
        ))}
      </select>

      <div className="h-4 w-px" style={{ background: 'var(--border)' }} />

      {/* Search */}
      <input
        ref={searchRef}
        type="search"
        placeholder="Filter (f)"
        value={filters.text}
        onChange={e => dispatch({ type: 'SET_FILTER_TEXT', text: e.target.value })}
        className="rounded px-2 py-1 text-xs w-44 focus:outline-none focus:ring-1"
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        aria-label="Filter requests"
      />

      <div className="h-4 w-px" style={{ background: 'var(--border)' }} />

      {/* Status buckets */}
      <div className="flex gap-1" role="group" aria-label="Status filter">
        {STATUS_BUCKETS.map(b => {
          const active = filters.statusBuckets.includes(b);
          return (
            <button
              key={b}
              onClick={() => dispatch({ type: 'TOGGLE_STATUS_BUCKET', bucket: b })}
              className="px-2 py-0.5 rounded text-xs font-medium transition-opacity"
              style={{
                background: active ? STATUS_COLORS[b] + '33' : 'transparent',
                color: STATUS_COLORS[b],
                border: `1px solid ${active ? STATUS_COLORS[b] : 'transparent'}`,
              }}
              aria-pressed={active}
            >
              {b}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px" style={{ background: 'var(--border)' }} />

      {/* Method filters */}
      <div className="flex gap-1" role="group" aria-label="Method filter">
        {METHODS.map(m => {
          const active = filters.methods.includes(m);
          return (
            <button
              key={m}
              onClick={() => dispatch({ type: 'TOGGLE_METHOD', method: m })}
              className="px-2 py-0.5 rounded text-xs font-mono font-medium transition-opacity"
              style={{
                background: active ? METHOD_TEXT_COLORS[m] + '22' : 'transparent',
                color: METHOD_TEXT_COLORS[m],
                border: `1px solid ${active ? METHOD_TEXT_COLORS[m] : 'transparent'}`,
              }}
              aria-pressed={active}
            >
              {m}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px" style={{ background: 'var(--border)' }} />

      {/* Hide cached */}
      <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={filters.hideCached}
          onChange={e => dispatch({ type: 'SET_HIDE_CACHED', value: e.target.checked })}
          className="rounded"
          aria-label="Hide cached"
        />
        Hide cached
      </label>

      <div className="h-4 w-px" style={{ background: 'var(--border)' }} />

      {/* Sort */}
      <div className="flex items-center gap-1">
        <span style={{ color: 'var(--text-muted)' }} className="text-xs">Sort:</span>
        <select
          value={sort.key}
          onChange={e => dispatch({ type: 'SET_SORT', key: e.target.value as SortKey, direction: sort.direction })}
          className="rounded px-2 py-1 text-xs focus:outline-none"
          style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => dispatch({ type: 'SET_SORT', key: sort.key, direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
          className="px-1.5 py-1 rounded text-xs"
          style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          aria-label={`Sort direction: ${sort.direction}`}
        >
          {sort.direction === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Row count */}
      <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
        {state.requests.length} requests
      </span>
    </div>
  );
}
