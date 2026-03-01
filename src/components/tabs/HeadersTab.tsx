import type { TraceRequest } from '../../types/trace';

interface Props { request: TraceRequest }

export function HeadersTab({ request }: Props) {
  return (
    <div className="p-3 space-y-3">
      <HeaderSection title="Request Headers" headers={request.requestHeaders} />
      <HeaderSection title="Response Headers" headers={request.responseHeaders} />
    </div>
  );
}

function HeaderSection({ title, headers }: { title: string; headers: Record<string, string> }) {
  return (
    <div>
      <div className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{title}</div>
      <div className="rounded p-2 space-y-1" style={{ background: 'var(--bg-base)' }}>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2 text-xs">
            <span className="font-mono flex-shrink-0" style={{ color: 'var(--accent-blue)', minWidth: 140 }}>{key}</span>
            <span className="font-mono break-all flex-1" style={{ color: 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
