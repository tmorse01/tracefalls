import type { ScenarioConfig, TraceRequest, TimingPhases, HttpMethod, StatusBucket } from '../types/trace';

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const PATHS = [
  '/api/users', '/api/users/:id', '/api/products', '/api/products/:id',
  '/api/orders', '/api/cart', '/api/checkout', '/api/auth/login',
  '/api/auth/refresh', '/api/search', '/api/recommendations',
  '/static/app.js', '/static/vendor.js', '/static/app.css',
  '/cdn/image.png', '/cdn/logo.svg', '/cdn/font.woff2',
  '/api/metrics', '/api/events', '/api/notifications',
  '/api/upload', '/api/files', '/api/comments',
];

const INITIATORS = ['script', 'fetch', 'xhr', 'img', 'link', 'navigation'];

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const METHOD_WEIGHTS = [0.60, 0.20, 0.08, 0.06, 0.06];

const STATUS_CODES = [200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 429, 500, 502, 503];
const STATUS_WEIGHTS = [0.50, 0.10, 0.05, 0.03, 0.03, 0.05, 0.04, 0.04, 0.03, 0.04, 0.02, 0.03, 0.02, 0.02];

function pickWeighted<T>(items: T[], weights: number[], rand: () => number): T {
  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return items[i];
  }
  return items[items.length - 1];
}

function statusBucket(status: number): StatusBucket {
  if (status >= 200 && status < 300) return '2xx';
  if (status >= 300 && status < 400) return '3xx';
  if (status >= 400 && status < 500) return '4xx';
  if (status >= 500) return '5xx';
  return 'pending';
}

function makeTiming(duration: number, rand: () => number): TimingPhases {
  const shares = Array.from({ length: 6 }, () => rand());
  const raw = {
    dns:     shares[0] * 0.1,
    connect: shares[1] * 0.15,
    ssl:     shares[2] * 0.1,
    send:    shares[3] * 0.05,
    wait:    shares[4] * 0.5,
    receive: shares[5] * 0.1,
  };
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const scale = duration / total;
  const phases: TimingPhases = {
    dns:     Math.round(raw.dns * scale),
    connect: Math.round(raw.connect * scale),
    ssl:     Math.round(raw.ssl * scale),
    send:    Math.round(raw.send * scale),
    wait:    Math.round(raw.wait * scale),
    receive: 0,
  };
  const sum = phases.dns + phases.connect + phases.ssl + phases.send + phases.wait;
  phases.receive = Math.max(0, duration - sum);
  return phases;
}

function makeHeaders(method: HttpMethod, status: number, rand: () => number): {
  req: Record<string, string>;
  res: Record<string, string>;
} {
  const contentTypes = ['application/json', 'text/html', 'text/plain', 'image/png', 'font/woff2'];
  const ct = contentTypes[Math.floor(rand() * contentTypes.length)];
  return {
    req: {
      'Accept': 'application/json, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': rand() > 0.5 ? 'no-cache' : 'max-age=3600',
      ...(method !== 'GET' && method !== 'HEAD' ? { 'Content-Type': 'application/json' } : {}),
      'User-Agent': 'Mozilla/5.0 (TraceFalls Demo)',
    },
    res: {
      'Content-Type': ct,
      'Content-Length': String(Math.floor(rand() * 50000 + 100)),
      'Cache-Control': rand() > 0.7 ? 'public, max-age=31536000' : 'no-cache',
      'X-Request-Id': `req-${Math.floor(rand() * 1e9).toString(16)}`,
      ...(status >= 400 ? { 'X-Error-Code': `E${status}` } : {}),
    },
  };
}

export function generateTrace(config: ScenarioConfig): TraceRequest[] {
  const rand = mulberry32(config.seed);
  const requests: TraceRequest[] = [];

  const totalSpreadMs = 1000 + Math.floor(rand() * 7000);

  for (let i = 0; i < config.requestCount; i++) {
    const wave = Math.floor(rand() * 6);
    const waveCenter = (wave / 6) * totalSpreadMs;
    const jitter = (rand() - 0.5) * (totalSpreadMs / 4);
    const startMs = Math.max(0, Math.round(waveCenter + jitter));

    const duration = Math.round(20 + rand() * 2000);
    const endMs = startMs + duration;

    const method = pickWeighted(METHODS, METHOD_WEIGHTS, rand);
    const status = pickWeighted(STATUS_CODES, STATUS_WEIGHTS, rand);
    const cached = rand() < 0.1;

    const pathTemplate = PATHS[Math.floor(rand() * PATHS.length)];
    const path = pathTemplate.replace(':id', String(Math.floor(rand() * 1000)));
    const url = `https://api.example.com${path}`;

    const { req, res } = makeHeaders(method, status, rand);
    const size = Number(res['Content-Length']);

    const timing = cached
      ? { dns: 0, connect: 0, ssl: 0, send: 1, wait: Math.max(0, duration - 2), receive: 1 }
      : makeTiming(duration, rand);

    requests.push({
      id: `req-${i}`,
      name: path,
      url,
      method,
      status,
      statusBucket: statusBucket(status),
      startMs,
      endMs,
      duration,
      size,
      timing,
      initiator: INITIATORS[Math.floor(rand() * INITIATORS.length)],
      cached,
      requestHeaders: req,
      responseHeaders: res,
      requestPayload: (method === 'POST' || method === 'PUT') ? JSON.stringify({ data: `payload-${i}` }) : null,
      responsePreview: status < 400 ? JSON.stringify({ success: true, id: i }) : JSON.stringify({ error: `Error ${status}` }),
    });
  }

  return requests;
}
