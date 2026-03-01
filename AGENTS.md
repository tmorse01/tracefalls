# TraceFalls Architecture Decisions

## Goal
Document concrete architecture and tech-stack choices for implementation consistency.

## Chosen Stack
- Runtime: React 19 + TypeScript + Vite.
- Package manager: pnpm.
- Styling: Tailwind CSS (utility-first) with CSS variables for theme tokens.
- State: React Context + `useReducer`.
- Virtualization: `@tanstack/react-virtual`.
- Component primitives: Radix UI (only where native elements are not enough).
- Utility libs: keep dependencies minimal and intentional.

## Why These Choices
- React Context + `useReducer` keeps global state predictable without introducing a heavy state library.
- `@tanstack/react-virtual` is lightweight, performant, and purpose-built for large row sets.
- Tailwind speeds up layout iteration while keeping styles colocated with components.
- Radix UI provides accessible primitives (tabs, tooltip, select, scroll regions) without imposing full design-system lock-in.

## State Architecture
Single app store in `src/state/store.tsx` with typed actions and selectors.

State slices:
- `scenario`: current scenario id and seed.
- `requests`: generated trace request array.
- `filters`: text, status bucket(s), method(s), hide cached.
- `sort`: key + direction.
- `viewport`: `startMs`, `endMs`, `totalMs`, zoom level.
- `selection`: ordered selected ids.
- `ui`: details tab, hover/playhead timestamp, dragging flags.

## Data Model Contracts
Define in `src/types/trace.ts`:
- `TraceRequest`
- `TimingPhases`
- `ScenarioConfig`
- `SortKey`, `StatusBucket`, `DetailsTab`

Rules:
- `endMs > startMs`
- sum of timing phases equals `endMs - startMs`
- all generated data must be deterministic for a given `(scenario, seed)`

## Rendering Architecture
- `AppShell`: top-level 3-zone layout (toolbar, center waterfall, right details panel).
- `Toolbar`: filtering/sorting/scenario controls.
- `Minimap`: global overview + visible-window scrubber.
- `WaterfallViewport`: sticky left columns + scrollable timeline body.
- `WaterfallRow`: single row rendering + bar interactions.
- `DetailsPanel`: single/multi-select views with tabbed content.

## Timeline/Viewport Model
- Keep a single source of truth: `viewport.startMs` and `viewport.endMs`.
- Convert using helpers:
  - `msToPx(ms, viewport, width)`
  - `pxToMs(px, viewport, width)`
- Pan adjusts both `startMs` and `endMs` by delta.
- Zoom is cursor-centered and clamped to min/max window sizes.
- Minimap and main viewport update the same store actions.

## Interaction Rules
- Click row/bar: single-select.
- `Shift+Click`: range select by visible sorted order.
- `Cmd/Ctrl+Click`: toggle id in selection.
- `Esc`: clear selection.
- `f`: focus search input.
- `+` / `-`: zoom in/out.

## Performance Rules
- Virtualize rows at all times.
- Memoize derived row props and filter/sort results.
- Avoid per-row inline closures in hot paths.
- Keep hover/playhead rendering cheap and isolated.
- Target smooth interaction at 2,000 rows.

## Initial Dependencies To Add
- `@tanstack/react-virtual`
- `tailwindcss`
- `@tailwindcss/vite`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-select`
- `@radix-ui/react-scroll-area`

Install command:
- `pnpm add @tanstack/react-virtual tailwindcss @tailwindcss/vite @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-select @radix-ui/react-scroll-area`

## File Plan
- `src/types/trace.ts`
- `src/data/scenarios.ts`
- `src/data/generateTrace.ts`
- `src/state/store.tsx`
- `src/components/AppShell.tsx`
- `src/components/Toolbar.tsx`
- `src/components/Minimap.tsx`
- `src/components/WaterfallViewport.tsx`
- `src/components/WaterfallRow.tsx`
- `src/components/DetailsPanel.tsx`
- `src/components/tabs/SummaryTab.tsx`
- `src/components/tabs/HeadersTab.tsx`
- `src/components/tabs/PayloadTab.tsx`
- `src/components/tabs/WaterfallTab.tsx`
- `src/styles/globals.css`

## Non-Goals For v1
- Real network capture import.
- Backend APIs.
- Persisted user preferences.
- Complex charting libs.
