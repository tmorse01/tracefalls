export interface TimingPhases {
    queued: number;
    dns: number;
    tcp: number;
    tls: number;
    request: number;
    response: number;
}

export interface TraceRequest {
    id: string;
    url: string;
    method: string;
    status: number;
    startMs: number;
    endMs: number;
    phases: TimingPhases;
    isCached: boolean;
    sizeBytes: number;
    type: 'html' | 'js' | 'css' | 'image' | 'font' | 'fetch' | 'other';
}

export type ScenarioId = 'homepage' | 'checkout' | 'upload' | 'api-spike';

export interface ScenarioConfig {
    id: ScenarioId;
    name: string;
    seed: number;
    baseCount: number;
}

export type SortKey = 'startMs' | 'endMs' | 'url' | 'method' | 'status' | 'duration';
export type SortDirection = 'asc' | 'desc';

export type StatusBucket = 'all' | '2xx' | '3xx' | '4xx' | '5xx';

export type DetailsTab = 'summary' | 'headers' | 'payload' | 'waterfall';
