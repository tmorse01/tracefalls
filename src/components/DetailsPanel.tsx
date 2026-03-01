import { useStore } from "../state/store";
import type { DetailsTab } from "../types/trace";
import { SummaryTab } from "./tabs/SummaryTab";
import { HeadersTab } from "./tabs/HeadersTab";
import { PayloadTab } from "./tabs/PayloadTab";
import { WaterfallTab } from "./tabs/WaterfallTab";
import * as Tabs from "@radix-ui/react-tabs";
import { Cross1Icon } from "@radix-ui/react-icons";

const TABS: { id: DetailsTab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "headers", label: "Headers" },
  { id: "payload", label: "Payload" },
  { id: "waterfall", label: "Waterfall" },
];

export function DetailsPanel() {
  const { state, dispatch } = useStore();
  const { selection, ui, requests } = state;

  const selectedRequests = requests.filter((r) => selection.includes(r.id));
  if (selectedRequests.length === 0) return null;

  const activeTab = ui.detailsTab;
  const primary = selectedRequests[0];

  return (
    <div
      className="flex flex-col h-full text-sm overflow-hidden"
      style={{ background: "var(--bg-surface)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="text-xs font-medium truncate flex-1 mr-2"
          style={{ color: "var(--text-primary)" }}
        >
          {selection.length === 1
            ? primary.name
            : `${selection.length} requests selected`}
        </span>
        <button
          onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
          className="px-1.5 rounded hover:opacity-70 flex-shrink-0 flex items-center justify-center w-6 h-6"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close details panel"
        >
          <Cross1Icon width={20} height={20} />
        </button>
      </div>

      {/* Tabs */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(tab) =>
          dispatch({ type: "SET_DETAILS_TAB", tab: tab as DetailsTab })
        }
        className="flex flex-col flex-1 overflow-hidden"
      >
        <Tabs.List
          className="flex border-b flex-shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none data-[state=active]:text-blue-500"
              style={{
                color:
                  activeTab === tab.id
                    ? "var(--accent-blue)"
                    : "var(--text-muted)",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--accent-blue)"
                    : "2px solid transparent",
                background: "transparent",
              }}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Tab content */}
        <Tabs.Content
          value="summary"
          className="flex-1 overflow-auto focus:outline-none"
        >
          <SummaryTab requests={selectedRequests} />
        </Tabs.Content>
        <Tabs.Content
          value="headers"
          className="flex-1 overflow-auto focus:outline-none"
        >
          <HeadersTab request={primary} />
        </Tabs.Content>
        <Tabs.Content
          value="payload"
          className="flex-1 overflow-auto focus:outline-none"
        >
          <PayloadTab request={primary} />
        </Tabs.Content>
        <Tabs.Content
          value="waterfall"
          className="flex-1 overflow-auto focus:outline-none"
        >
          <WaterfallTab request={primary} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
