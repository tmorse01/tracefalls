/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { TraceRequest, SortKey, StatusBucket, DetailsTab, ViewportState, ScenarioConfig } from '../types/trace';
import { generateTrace } from '../data/generateTrace';
import { getScenario, SCENARIOS } from '../data/scenarios';

export interface FiltersState {
  text: string;
  statusBuckets: StatusBucket[];
  methods: string[];
  hideCached: boolean;
}

export interface SortState {
  key: SortKey;
  direction: 'asc' | 'desc';
}

export interface UIState {
  detailsTab: DetailsTab;
  hoverMs: number | null;
  playheadMs: number | null;
  isDragging: boolean;
}

export interface AppState {
  scenario: ScenarioConfig;
  requests: TraceRequest[];
  filters: FiltersState;
  sort: SortState;
  viewport: ViewportState;
  selection: string[];
  ui: UIState;
}

type Action =
  | { type: 'SET_SCENARIO'; scenarioId: string }
  | { type: 'SET_FILTER_TEXT'; text: string }
  | { type: 'TOGGLE_STATUS_BUCKET'; bucket: StatusBucket }
  | { type: 'TOGGLE_METHOD'; method: string }
  | { type: 'SET_HIDE_CACHED'; value: boolean }
  | { type: 'SET_SORT'; key: SortKey; direction: 'asc' | 'desc' }
  | { type: 'SET_VIEWPORT'; viewport: Partial<ViewportState> }
  | { type: 'ZOOM_VIEWPORT'; factor: number; centerMs?: number }
  | { type: 'PAN_VIEWPORT'; deltaMs: number }
  | { type: 'SELECT_SINGLE'; id: string }
  | { type: 'SELECT_RANGE'; ids: string[] }
  | { type: 'TOGGLE_SELECT'; id: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_DETAILS_TAB'; tab: DetailsTab }
  | { type: 'SET_HOVER_MS'; ms: number | null }
  | { type: 'SET_PLAYHEAD_MS'; ms: number | null }
  | { type: 'SET_IS_DRAGGING'; value: boolean };

function buildInitialState(): AppState {
  const scenario = SCENARIOS[0];
  const requests = generateTrace(scenario);
  const totalMs = Math.max(...requests.map(r => r.endMs), 1000);
  return {
    scenario,
    requests,
    filters: { text: '', statusBuckets: [], methods: [], hideCached: false },
    sort: { key: 'startMs', direction: 'asc' },
    viewport: { startMs: 0, endMs: totalMs, totalMs },
    selection: [],
    ui: { detailsTab: 'summary', hoverMs: null, playheadMs: null, isDragging: false },
  };
}

const MIN_WINDOW_MS = 50;

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCENARIO': {
      const scenario = getScenario(action.scenarioId);
      const requests = generateTrace(scenario);
      const totalMs = Math.max(...requests.map(r => r.endMs), 1000);
      return {
        ...state,
        scenario,
        requests,
        viewport: { startMs: 0, endMs: totalMs, totalMs },
        selection: [],
      };
    }
    case 'SET_FILTER_TEXT':
      return { ...state, filters: { ...state.filters, text: action.text } };
    case 'TOGGLE_STATUS_BUCKET': {
      const buckets = state.filters.statusBuckets.includes(action.bucket)
        ? state.filters.statusBuckets.filter(b => b !== action.bucket)
        : [...state.filters.statusBuckets, action.bucket];
      return { ...state, filters: { ...state.filters, statusBuckets: buckets } };
    }
    case 'TOGGLE_METHOD': {
      const methods = state.filters.methods.includes(action.method)
        ? state.filters.methods.filter(m => m !== action.method)
        : [...state.filters.methods, action.method];
      return { ...state, filters: { ...state.filters, methods } };
    }
    case 'SET_HIDE_CACHED':
      return { ...state, filters: { ...state.filters, hideCached: action.value } };
    case 'SET_SORT':
      return { ...state, sort: { key: action.key, direction: action.direction } };
    case 'SET_VIEWPORT':
      return { ...state, viewport: { ...state.viewport, ...action.viewport } };
    case 'ZOOM_VIEWPORT': {
      const { startMs, endMs, totalMs } = state.viewport;
      const windowMs = endMs - startMs;
      const center = action.centerMs ?? (startMs + windowMs / 2);
      const newWindow = Math.min(totalMs, Math.max(MIN_WINDOW_MS, windowMs / action.factor));
      const ratio = (center - startMs) / windowMs;
      let newStart = center - ratio * newWindow;
      let newEnd = newStart + newWindow;
      if (newStart < 0) { newStart = 0; newEnd = newWindow; }
      if (newEnd > totalMs) { newEnd = totalMs; newStart = totalMs - newWindow; }
      return { ...state, viewport: { ...state.viewport, startMs: Math.round(newStart), endMs: Math.round(newEnd) } };
    }
    case 'PAN_VIEWPORT': {
      const { startMs, endMs, totalMs } = state.viewport;
      const windowMs = endMs - startMs;
      let newStart = startMs + action.deltaMs;
      if (newStart < 0) newStart = 0;
      if (newStart + windowMs > totalMs) newStart = totalMs - windowMs;
      return { ...state, viewport: { ...state.viewport, startMs: Math.round(newStart), endMs: Math.round(newStart + windowMs) } };
    }
    case 'SELECT_SINGLE':
      return { ...state, selection: [action.id] };
    case 'SELECT_RANGE':
      return { ...state, selection: action.ids };
    case 'TOGGLE_SELECT': {
      const sel = state.selection.includes(action.id)
        ? state.selection.filter(id => id !== action.id)
        : [...state.selection, action.id];
      return { ...state, selection: sel };
    }
    case 'CLEAR_SELECTION':
      return { ...state, selection: [] };
    case 'SET_DETAILS_TAB':
      return { ...state, ui: { ...state.ui, detailsTab: action.tab } };
    case 'SET_HOVER_MS':
      return { ...state, ui: { ...state.ui, hoverMs: action.ms } };
    case 'SET_PLAYHEAD_MS':
      return { ...state, ui: { ...state.ui, playheadMs: action.ms } };
    case 'SET_IS_DRAGGING':
      return { ...state, ui: { ...state.ui, isDragging: action.value } };
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useFilteredSortedRequests() {
  const { state } = useStore();
  return useMemo(() => {
    const { requests, filters, sort } = state;
    let result = requests;

    if (filters.text) {
      const q = filters.text.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q) || r.url.toLowerCase().includes(q));
    }
    if (filters.statusBuckets.length > 0) {
      result = result.filter(r => filters.statusBuckets.includes(r.statusBucket));
    }
    if (filters.methods.length > 0) {
      result = result.filter(r => filters.methods.includes(r.method));
    }
    if (filters.hideCached) {
      result = result.filter(r => !r.cached);
    }

    return [...result].sort((a, b) => {
      let diff = 0;
      switch (sort.key) {
        case 'startMs':  diff = a.startMs - b.startMs; break;
        case 'duration': diff = a.duration - b.duration; break;
        case 'size':     diff = a.size - b.size; break;
        case 'status':   diff = a.status - b.status; break;
        case 'name':     diff = a.name.localeCompare(b.name); break;
      }
      return sort.direction === 'asc' ? diff : -diff;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.requests, state.filters, state.sort]);
}
