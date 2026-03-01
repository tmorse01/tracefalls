import { TraceRequest, ScenarioConfig, TimingPhases } from '../types/trace';
import { Random } from '../utils/random';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];
const STATUSES = [200, 204, 301, 304, 400, 401, 403, 404, 500, 503];
const TYPES: TraceRequest['type'][] = ['html', 'js', 'css', 'image', 'font', 'fetch', 'other'];

const DOMAINS = ['api.example.com', 'cdn.example.com', 'assets.example.com', 'example.com'];
const PATHS = [
    '/users/me', '/products', '/cart/123/items', '/analytics/events',
    '/main.js', '/vendor.js', '/styles.css', '/logo.png', '/font.woff2'
];

export function generateTraceParams(config: ScenarioConfig): TraceRequest[] {
    const rng = new Random(config.seed);
    const requests: TraceRequest[] = [];
    let currentStartMs = 0;

    for (let i = 0; i < config.baseCount; i++) {
        // Generate realistic timings
        const isCached = rng.boolean(0.15); // 15% cached
        const isSlow = rng.boolean(0.05); // 5% really slow

        const duration = isCached
            ? rng.range(5, 20)
            : (isSlow ? rng.range(800, 3000) : rng.range(20, 300));

        const endMs = currentStartMs + duration;

        // Distribute phases ensuring they sum to exact duration
        let phases: TimingPhases;
        if (isCached) {
            phases = { queued: duration, dns: 0, tcp: 0, tls: 0, request: 0, response: 0 };
        } else {
            const q = rng.range(1, 5);
            const d = rng.boolean(0.2) ? rng.range(5, 50) : 0;
            const t = rng.boolean(0.8) ? rng.range(10, 30) : 0;
            const tl = t > 0 ? rng.range(20, 60) : 0;
            const req = rng.range(1, 10);

            const sumSoFar = q + d + t + tl + req;
            const res = Math.max(1, duration - sumSoFar); // Remaining goes to response

            // Normalize if somehow components exceed total duration
            if (sumSoFar >= duration) {
                const factor = (duration - 1) / sumSoFar;
                phases = {
                    queued: q * factor,
                    dns: d * factor,
                    tcp: t * factor,
                    tls: tl * factor,
                    request: req * factor,
                    response: 1
                };
            } else {
                phases = { queued: q, dns: d, tcp: t, tls: tl, request: req, response: res };
            }
        }

        const type = rng.choice(TYPES);
        const method = type === 'fetch' ? rng.choice(METHODS) : 'GET';
        const status = isCached ? 304 : rng.choice(STATUSES);

        requests.push({
            id: `req-${i}-${rng.next().toString(36).substr(2, 6)}`,
            url: `https://${rng.choice(DOMAINS)}${rng.choice(PATHS)}`,
            method,
            status,
            startMs: currentStartMs,
            endMs,
            phases,
            isCached,
            sizeBytes: isCached ? 0 : rng.range(100, 5000000), // up to 5mb
            type,
        });

        // Advance start time either parallely or sequentially
        const advanceMs = rng.boolean(0.8)
            ? rng.range(1, 20) // High concurrency padding
            : rng.range(50, 200); // Sparse concurrency

        currentStartMs += advanceMs;
    }

    return requests;
}
