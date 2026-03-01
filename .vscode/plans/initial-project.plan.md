# TraceFalls Initial Project Plan

## Project Goal
Build a React + TypeScript + Vite app that mimics a DevTools-style network waterfall for mock request traces, with smooth interaction up to 2,000 rows.

## Scope
- In scope: seeded mock trace generation, waterfall timeline, minimap windowing, filtering/sorting, selection + details panel, keyboard shortcuts, row virtualization.
- Out of scope (for v1): backend persistence, real HAR import/export, auth, collaborative features.

## Success Criteria
- Handles 2,000 generated requests without major frame drops during scroll/zoom/pan on a typical laptop.
- Every row shows method, name/path, status, duration, and a bar aligned to start/end time.
- Details panel supports single and multi-selection views.
- Filters and sorting update visible rows correctly.
- Keyboard shortcuts and tooltip behavior work as specified.

## Proposed Architecture

### Data + Domain
- `TraceRequest` domain type with normalized timing phases.
- `ScenarioConfig` for reproducible dataset generation.
- Seeded generator utility that produces realistic overlap, burst, slow, failed, and cached requests.

### State Management
Use `useReducer` + React context for shared app state:
- dataset/scenario
- filters/sort
- viewport (`startMs`, `endMs`, zoom level)
- selection set
- hovered/playhead timestamp

### Rendering Strategy
- Sticky left column for metadata.
- Independent timeline viewport for horizontal pan/zoom.
- Virtualized vertical list for rows.
- Minimap drives visible window by updating viewport state.

## Implementation Phases

## Phase 1: Foundation
- Initialize base folder structure and shared types.
- Replace template `App.tsx` with shell wiring.
- Add utility modules for formatting, math, and seeded randomness.

Acceptance:
- App boots with typed models and no lint/type errors.

## Phase 2: Mock Trace Generator
- Implement deterministic generator for scenarios: `Homepage`, `Checkout`, `Upload`, `API Spike`.
- Ensure timing phases sum to request duration.
- Include realistic status/method distributions and edge cases.

Acceptance:
- Scenario changes regenerate stable (seeded) data and row counts from 200 to 2,000.

## Phase 3: Core Layout + Toolbar
- Build `AppShell`, `Toolbar`, `Minimap`, `WaterfallViewport`, `DetailsPanel` scaffolds.
- Toolbar controls: search text, status/method filter, hide cached toggle, sort dropdown, scenario loader.

Acceptance:
- Controls update global state and visibly affect row list.

## Phase 4: Waterfall Viewport
- Render timeline axis and bars using ms -> px scaling.
- Add mouse playhead + timestamp label.
- Add wheel zoom and drag pan with bounded ranges.

Acceptance:
- Zoom and pan are smooth and keep bars aligned.

## Phase 5: Row Virtualization + Sticky Columns
- Implement virtualized list rendering for row stack.
- Keep left metadata columns sticky while timeline scrolls.
- Memoize heavy row computations.

Acceptance:
- 2,000-row scenario remains responsive during scroll and interaction.

## Phase 6: Selection + Details Panel
- Click for single-select; shift/cmd-click for multi-select.
- Tabs: `Summary`, `Headers`, `Payload`, `Waterfall`.
- Aggregate metrics for multi-select.

Acceptance:
- Selection logic is correct and panel content updates without lag.

## Phase 7: Minimap Windowing
- Draw compact overview bars.
- Add draggable visible-window selector that updates main viewport.

Acceptance:
- Minimap and main viewport stay synchronized bidirectionally.

## Phase 8: UX + Accessibility + Keyboard
- Shortcuts: `f`, `esc`, `+`, `-`.
- Hover tooltip for timing and phase breakdown.
- Improve focus states and ARIA labels for controls/tabs.

Acceptance:
- Keyboard interactions work and focus handling is predictable.

## Phase 9: Quality Gate
- Validate behavior manually across scenarios.
- Run lint + build.
- Update README with run instructions and feature notes.

Acceptance:
- `pnpm lint` and `pnpm build` pass; README is current.

## Suggested File Layout
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
- `src/styles/*.css`

## Risks and Mitigations
- Complex interaction coupling (zoom/pan/minimap/virtualization): keep viewport math in one shared module.
- Performance regressions at 2,000 rows: virtualize early and profile before final polish.
- Selection edge cases: centralize reducer actions and add unit tests for selection transitions.

## Definition of Done
- All success criteria met.
- No TypeScript/lint errors.
- Stable seeded scenarios.
- README includes `pnpm install` and `pnpm dev` run instructions.
