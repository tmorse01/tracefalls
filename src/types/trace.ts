export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export type StatusBucket = '2xx' | '3xx' | '4xx' | '5xx' | 'pending';

export type SortKey = 'startMs' | 'duration' | 'size' | 'status' | 'name';

export type DetailsTab = 'summary' | 'headers' | 'payload' | 'waterfall';

export interface TimingPhases {
  dns: number;
  connect: number;
  ssl: number;
  send: number;
  wait: number;
  receive: number;
}

export interface TraceRequest {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  status: number;
  statusBucket: StatusBucket;
  startMs: number;
  endMs: number;
  duration: number;
  size: number; // bytes
  timing: TimingPhases;
  initiator: string;
  cached: boolean;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestPayload: string | null;
  responsePreview: string | null;
}

export interface ScenarioConfig {
  id: string;
  label: string;
  requestCount: number;
  seed: number;
}

export interface ViewportState {
  startMs: number;
  endMs: number;
  totalMs: number;
}
