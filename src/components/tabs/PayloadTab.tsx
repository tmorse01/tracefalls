import type { TraceRequest } from '../../types/trace';

interface Props { request: TraceRequest }

export function PayloadTab({ request }: Props) {
  return (
    <div className="p-3 space-y-3">
      {request.requestPayload ? (
        <CodeSection title="Request Payload" content={request.requestPayload} />
      ) : (
        <Empty message="No request payload" />
      )}
      {request.responsePreview ? (
        <CodeSection title="Response Preview" content={request.responsePreview} />
      ) : (
        <Empty message="No response preview" />
      )}
    </div>
  );
}

function CodeSection({ title, content }: { title: string; content: string }) {
  let pretty = content;
  try { pretty = JSON.stringify(JSON.parse(content), null, 2); } catch { /* not JSON */ }
  return (
    <div>
      <div className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{title}</div>
      <pre className="rounded p-2 text-xs font-mono overflow-auto" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', maxHeight: 300, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {pretty}
      </pre>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{message}</p>;
}
