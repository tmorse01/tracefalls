import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../state/store';
import { Toolbar } from './Toolbar';
import { WaterfallViewport } from './WaterfallViewport';
import { DetailsPanel } from './DetailsPanel';
import { Minimap } from './Minimap';

export function AppShell() {
  const { state, dispatch } = useStore();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (e.key === 'Escape') {
      dispatch({ type: 'CLEAR_SELECTION' });
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }
    if (e.key === 'f' && !isInput) {
      e.preventDefault();
      searchRef.current?.focus();
    }
    if ((e.key === '+' || e.key === '=') && !isInput) {
      e.preventDefault();
      dispatch({ type: 'ZOOM_VIEWPORT', factor: 1.5 });
    }
    if (e.key === '-' && !isInput) {
      e.preventDefault();
      dispatch({ type: 'ZOOM_VIEWPORT', factor: 1 / 1.5 });
    }
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const hasSelection = state.selection.length > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Toolbar searchRef={searchRef} />
      <Minimap />
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-200 ${hasSelection ? 'mr-0' : ''}`}>
          <WaterfallViewport />
        </div>
        {hasSelection && (
          <div className="w-80 flex-shrink-0 border-l overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <DetailsPanel />
          </div>
        )}
      </div>
    </div>
  );
}
