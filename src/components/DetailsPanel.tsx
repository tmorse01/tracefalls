import React from 'react';
import { useAppStore } from '../state/store';

export function DetailsPanel() {
    const { state } = useAppStore();

    if (state.selection.size === 0) {
        return null;
    }

    return (
        <aside className="w-[350px] border-l border-panel-border bg-panel flex flex-col shrink-0">
            <div className="p-4 text-sm font-semibold border-b border-panel-border">
                {state.selection.size} Selected Request(s)
            </div>
            <div className="flex-1 p-4 overflow-auto text-sm text-text-muted">
                Details Panel Content Placeholder
            </div>
        </aside>
    );
}
