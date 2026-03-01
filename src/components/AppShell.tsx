import React from 'react';
import { Toolbar } from './Toolbar';
import { Minimap } from './Minimap';
import { WaterfallViewport } from './WaterfallViewport';
import { DetailsPanel } from './DetailsPanel';

export function AppShell() {
    return (
        <div className="flex flex-col h-full w-full bg-canvas text-text-main font-sans">
            <Toolbar />
            <Minimap />
            <div className="flex-1 flex overflow-hidden">
                <WaterfallViewport />
                <DetailsPanel />
            </div>
        </div>
    );
}
