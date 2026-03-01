import { useStore } from '../state/store';
import type { DetailsTab } from '../types/trace';
import { SummaryTab } from './tabs/SummaryTab';
import { HeadersTab } from './tabs/HeadersTab';
import { PayloadTab } from './tabs/PayloadTab';
import { WaterfallTab } from './tabs/WaterfallTab';

const TABS: { id: DetailsTab; label: string }[] = [
  { id: 'summary',   label: 'Summary' },
  { id: 'headers',   label: 'Headers' },
  { id: 'payload',   label: 'Payload' },
  { id: 'waterfall', label: 'Waterfall' },
];

export function DetailsPanel() {
  const { state, dispatch } = useStore();
  const { selection, ui, requests } = state;

  const selectedRequests = requests.filter(r => selection.includes(r.id));
  if (selectedRequests.length === 0) return null;

  const activeTab = ui.detailsTab;
  const primary = selectedRequests[0];

  return (
    <div className="flex flex-col h-full text-sm overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-medium truncate flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
          {selection.length === 1 ? primary.name : `${selection.length} requests selected`}
        </span>
        <button
          onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
          className="text-xs px-1 rounded hover:opacity-70 flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close details panel"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_DETAILS_TAB', tab: tab.id })}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              background: 'transparent',
            }}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'summary' && <SummaryTab requests={selectedRequests} />}
        {activeTab === 'headers' && <HeadersTab request={primary} />}
        {activeTab === 'payload' && <PayloadTab request={primary} />}
        {activeTab === 'waterfall' && <WaterfallTab request={primary} />}
      </div>
    </div>
  );
}
