import React from 'react';
import { useAppStore } from '../state/store';
import { scenarios } from '../data/scenarios';
import { ScenarioId, StatusBucket } from '../types/trace';

export function Toolbar() {
    const { state, dispatch } = useAppStore();

    return (
        <header className="h-14 border-b border-panel-border bg-panel flex items-center px-4 shrink-0 gap-4">
            <h1 className="font-semibold text-lg mr-4">TraceFalls</h1>

            <select
                className="bg-canvas border border-panel-border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                value={state.scenarioId}
                onChange={e => dispatch({ type: 'SET_SCENARIO', payload: e.target.value as ScenarioId })}
            >
                {Object.values(scenarios).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.baseCount} reqs)</option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Filter URLs..."
                className="bg-canvas border border-panel-border rounded px-2 py-1 text-sm outline-none focus:border-blue-500 w-64"
                value={state.filters.text}
                onChange={e => dispatch({ type: 'SET_FILTER_TEXT', payload: e.target.value })}
            />

            <select
                className="bg-canvas border border-panel-border rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                value={state.filters.status}
                onChange={e => dispatch({ type: 'SET_FILTER_STATUS', payload: e.target.value as StatusBucket })}
            >
                <option value="all">All Statuses</option>
                <option value="2xx">2xx</option>
                <option value="3xx">3xx</option>
                <option value="4xx">4xx</option>
                <option value="5xx">5xx</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main cursor-pointer select-none">
                <input
                    type="checkbox"
                    className="accent-blue-500 rounded"
                    checked={state.filters.hideCached}
                    onChange={() => dispatch({ type: 'TOGGLE_HIDE_CACHED' })}
                />
                Hide Cached
            </label>

            <div className="flex-1" />

            <div className="text-xs text-text-muted">
                {state.requests.length} Requests Total
            </div>
        </header>
    );
}
