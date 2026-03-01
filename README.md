# TraceFalls

A DevTools-style network waterfall viewer built with React 19 + TypeScript + Vite.

## Features
- 4 demo scenarios: Homepage Load (200 reqs), Checkout Flow (500), File Upload (800), API Spike (2,000)
- Waterfall timeline with zoom/pan (scroll wheel + Ctrl/⌘ to zoom, Alt+drag to pan)
- Minimap overview with draggable viewport scrubber
- Filtering by search text, HTTP method, status code bucket, cached toggle
- Sorting by start time, duration, size, status, name
- Row virtualization for smooth 2,000-row performance
- Single and multi-selection with Details panel (Summary, Headers, Payload, Waterfall tabs)
- Keyboard shortcuts: `f` (focus search), `Esc` (clear selection), `+`/`-` (zoom)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
pnpm build
```

## Lint

```bash
pnpm lint
```
