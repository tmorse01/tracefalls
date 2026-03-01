import { createContext, useReducer, ReactNode, useContext, useMemo } from 'react';
import type {
    ScenarioId,
    TraceRequest,
    SortKey,
    StatusBucket,
    DetailsTab,
    SortDirection
} from '../types/trace';
import { defaultScenario, scenarios } from '../data/scenarios';
import { generateTraceParams } from '../data/generateTrace';

export interface ViewportState {
    startMs: number;
    endMs: number;
    totalMs: number;
}

export interface AppState {
    scenarioId: ScenarioId;
    requests: TraceRequest[];

    filters: {
        text: string;
        status: StatusBucket;
        hideCached: boolean;
    };

    sort: {
        key: SortKey;
        direction: SortDirection;
    };

    viewport: ViewportState;

    selection: Set<string>;

    ui: {
        detailsTab: DetailsTab;
        hoverId: string | null;
    };
}

const initialScenario = defaultScenario;
const initialRequests = generateTraceParams(initialScenario);
const maxEndMs = Math.max(...initialRequests.map(r => r.endMs));

const initialState: AppState = {
    scenarioId: initialScenario.id,
    requests: initialRequests,
    filters: {
        text: '',
        status: 'all',
        hideCached: false,
    },
    sort: {
        key: 'startMs',
        direction: 'asc',
    },
    viewport: {
        startMs: 0,
        endMs: maxEndMs,
        totalMs: maxEndMs,
    },
    selection: new Set(),
    ui: {
        detailsTab: 'summary',
        hoverId: null,
    },
};

export type Action =
    | { type: 'SET_SCENARIO'; payload: ScenarioId }
    | { type: 'SET_FILTER_TEXT'; payload: string }
    | { type: 'SET_FILTER_STATUS'; payload: StatusBucket }
    | { type: 'TOGGLE_HIDE_CACHED' }
    | { type: 'SET_SORT'; payload: { key: SortKey; direction: SortDirection } }
    | { type: 'SET_VIEWPORT'; payload: { startMs: number; endMs: number } }
    | { type: 'TOGGLE_SELECTION'; payload: string }
    | { type: 'SET_SELECTION'; payload: string[] }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'SET_DETAILS_TAB'; payload: DetailsTab }
    | { type: 'SET_HOVER'; payload: string | null };

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_SCENARIO': {
            const config = scenarios[action.payload];
            if (!config) return state;
            const requests = generateTraceParams(config);
            const totalMs = Math.max(...requests.map(r => r.endMs), 1);
            return {
                ...state,
                scenarioId: action.payload,
                requests,
                viewport: { startMs: 0, endMs: totalMs, totalMs },
                selection: new Set(),
            };
        }
        case 'SET_FILTER_TEXT':
            return { ...state, filters: { ...state.filters, text: action.payload } };
        case 'SET_FILTER_STATUS':
            return { ...state, filters: { ...state.filters, status: action.payload } };
        case 'TOGGLE_HIDE_CACHED':
            return { ...state, filters: { ...state.filters, hideCached: !state.filters.hideCached } };
        case 'SET_SORT':
            return { ...state, sort: action.payload };
        case 'SET_VIEWPORT':
            return {
                ...state,
                viewport: {
                    ...state.viewport,
                    startMs: Math.max(0, action.payload.startMs),
                    endMs: Math.min(state.viewport.totalMs, action.payload.endMs),
                },
            };
        case 'TOGGLE_SELECTION': {
            const next = new Set(state.selection);
            if (next.has(action.payload)) next.delete(action.payload);
            else next.add(action.payload);
            return { ...state, selection: next };
        }
        case 'SET_SELECTION':
            return { ...state, selection: new Set(action.payload) };
        case 'CLEAR_SELECTION':
            return { ...state, selection: new Set() };
        case 'SET_DETAILS_TAB':
            return { ...state, ui: { ...state.ui, detailsTab: action.payload } };
        case 'SET_HOVER':
            return { ...state, ui: { ...state.ui, hoverId: action.payload } };
        default:
            return state;
    }
}

export const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const contextValue = useMemo(() => ({ state, dispatch }), [state]);

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppStore() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppStore must be used within an AppProvider');
    return context;
}
