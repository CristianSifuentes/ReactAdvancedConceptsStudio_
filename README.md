# React Advanced Concepts Studio

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![No Build Step](https://img.shields.io/badge/build-none%20%28ESM%20CDN%29-informational)
![License](https://img.shields.io/badge/license-Apache--2.0-blue)

A single-file, no-bundler React 19 laboratory that turns rendering internals — render/commit, reconciliation, memoization, concurrent features, resilience — into six interactive, independently runnable exhibits. Everything lives in three static files (`index.html`, `script.js`, `styles.css`) and runs React straight from `esm.sh`, so the entire studio is inspectable in a single 1,874-line source file with no build step to reason about.

## Table of Contents

- [Overview](#overview)
- [Mental Model — The Studio Floor Plan](#mental-model--the-studio-floor-plan)
- [Repository Structure](#repository-structure)
- [Core Concepts / Deep Dive](#core-concepts--deep-dive)
  - [1. `htm` instead of JSX — no build step, still declarative](#1-htm-instead-of-jsx--no-build-step-still-declarative)
  - [2. Re-render Lab — `React.memo`, referential equality, and function props](#2-re-render-lab--reactmemo-referential-equality-and-function-props)
  - [3. Reconciliation Lab — keys, identity, and `useTransition`](#3-reconciliation-lab--keys-identity-and-usetransition)
  - [4. Performance Lab — `useDeferredValue` + `useTransition` over 1,805 rows](#4-performance-lab--usedeferredvalue--usetransition-over-1805-rows)
  - [5. External stores via `useSyncExternalStore`](#5-external-stores-via-usesyncexternalstore)
  - [6. Stability Sandbox — a class-based `ErrorBoundary`](#6-stability-sandbox--a-class-based-errorboundary)
  - [7. Lazy Checklist Panel — `React.lazy` + `Suspense`](#7-lazy-checklist-panel--reactlazy--suspense)
- [Getting Started](#getting-started)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Further Reading / Related Repos](#further-reading--related-repos)
- [License](#license)

## Overview

The GitHub description calls this "a repository for [learning] more about React concepts like a studio," and `script.js` delivers on that literally: the UI is organized as a hero, a left concept rail, a main column of four interactive labs, and a right rail of status/feed/error-boundary/lazy-loaded panels — a floor plan, not a tutorial list. Every concept card (`CONCEPTS` array, `render`, `rerender`, `virtual-dom`, `reconciliation`, `performance`) is paired with a runnable probe, not just prose, so the claim being taught is falsifiable in the browser: click a button, watch a render counter, and confirm (or break) the mental model.

Notably, this repository ships **zero dependencies to install** — `react@19`, `react-dom@19/client`, and `htm@3.1.1` are imported directly from `esm.sh` inside `script.js`, and there is no `package.json`. `python3 -m http.server` (or any static file server) is the entire toolchain.

## Mental Model — The Studio Floor Plan

The six exhibits are independent probes into the same underlying question React engineers have to answer daily: *why did this component render, and was the work necessary?* Each lab isolates one layer of that question.

```mermaid
mindmap
  root((React Advanced<br/>Concepts Studio))
    Render Pipeline
      CreateElementLab
        JSX vs React.createElement
        4 worked examples, live factory()
      PipelineBoard
        01 JSX/createElement
        02 Render phase
        03 Diff/Reconciliation
        04 Commit
    Re-render Lab
      PlainPassiveChild
        re-renders every parent render
      MemoPassiveChild
        React.memo, no props, never re-renders
      PlainCounterChild vs MemoCounterChild
        prop-driven re-render comparison
      CallbackChild
        function-identity-as-prop probe
    Reconciliation Lab
      IdentityListPreview strategy=keyed
        key={item.id}, identity preserved
      IdentityListPreview strategy=indexed
        key={index}, identity can scramble
      prepend / shuffle / remove-middle / reset
        wrapped in startTransition
    Performance Lab
      1805-row SEARCH_DATASET
      useDeferredValue(query)
        urgent vs deferred query shown side by side
      useTransition
        isPending chip, non-blocking filter
      useId
        stable input/label association
    External Stores
      useViewport via useSyncExternalStore
        window resize + prefers-reduced-motion
      useClock via useSyncExternalStore
        setInterval-backed snapshot store
    Resilience
      DemoErrorBoundary class component
        getDerivedStateFromError, componentDidCatch
      StabilitySandbox
        CrashySnippet throws on demand
        key-based remount to reset boundary
    Deferred Loading
      LazyChecklistPanel
        React.lazy + Suspense, 600ms simulated fetch
```

Design principle encoded directly in the layout (`StatusRail`, `NavRail`, `ConceptDeck`): **observe first** (render counters, an activity feed built on `useReducer`), **experiment second** (buttons that mutate state you can watch propagate), **explain always** (each concept card carries an `interview` prompt — this studio doubles as senior-interview prep).

## Repository Structure

```text
.
├── index.html    # Shell + <div id="root">; loads Google Fonts, preconnects to esm.sh
├── script.js      # Entire React app: concepts, 4 labs, 2 external stores, ErrorBoundary, lazy panel (1,874 lines)
├── styles.css      # Full design system: CSS Grid/Flexbox layout, tokens, responsive breakpoints (1,364 lines)
├── README.md       # This file
└── LICENSE          # Apache-2.0
```

There is intentionally no `src/`, no `package.json`, and no bundler config — the constraint is the point: React's rendering model stays visible because nothing is compiled away.

## Core Concepts / Deep Dive

### 1. `htm` instead of JSX — no build step, still declarative

```js
import htm from "https://esm.sh/htm@3.1.1";
const html = htm.bind(React.createElement);
```

Every component in `script.js` is written with `html\`...\`` tagged templates instead of JSX. `htm` parses the tagged-template literal at runtime and calls `React.createElement` under the hood — functionally identical output to what Babel would produce from JSX, but with zero transpilation step. The `CreateElementLab` exhibit (`CREATE_ELEMENT_EXAMPLES`) makes this equivalence explicit: each example ships both a JSX string *and* a hand-written `React.createElement` call plus a `factory()` that actually constructs the element, so visitors see JSX, `createElement`, and the resulting element side by side.

### 2. Re-render Lab — `React.memo`, referential equality, and function props

```js
function PlainPassiveChild() {
  const renders = useRenderCount();
  return html`<div>...render #${renders}...</div>`;
}

const MemoPassiveChild = memo(function MemoPassiveChild() {
  const renders = useRenderCount();
  return html`<div>...render #${renders}...</div>`;
});
```

`useRenderCount` (`useRef` incremented on every call, no state — so counting the ref doesn't itself trigger a render) turns an invisible fact — "did this function body execute again?" — into a number rendered on screen. Placing `PlainPassiveChild` and `MemoPassiveChild` next to each other under the same parent makes React's default behavior undeniable: a function component re-executes whenever its parent re-renders, *unless* it is wrapped in `React.memo`, in which case React shallow-compares the previous and next props and bails out of re-rendering (and re-invoking the function) when they're equal.

`CallbackChild` pushes the lesson one step further — it accepts `onPing`, a function prop. If the parent recreates that function on every render (a fresh closure), `React.memo`'s shallow prop comparison sees a new reference and re-renders anyway, which is exactly the failure mode `useCallback` exists to prevent (see the companion repo `_PropDrillingReact` for a focused `useCallback` walkthrough).

### 3. Reconciliation Lab — keys, identity, and `useTransition`

```js
${showHints && html`
  <div className="compare-hints">
    <div className="hint-card"><h4>Con keys estables</h4><p>${hint.keyed}</p></div>
    <div className="hint-card"><h4>Con índice como key</h4><p>${hint.index}</p></div>
  </div>
`}

<${IdentityListPreview} items=${state.items} strategy="keyed" .../>
<${IdentityListPreview} items=${state.items} strategy="indexed" .../>
```

Two lists rendering the same underlying data, side by side — one keyed by `item.id`, one keyed by array index — driven by `prepend`, `shuffle`, and `remove-middle` actions. Each `IdentityListPreview` row (`StateIdentityRow`) mints a random `mountToken` in a `useRef` on first mount; because `useRef` values persist across re-renders of the *same* component instance but are lost on unmount/remount, watching whether a row's token survives a `prepend` or `shuffle` operation is a direct, visible readout of React's reconciliation algorithm: same key at the same tree position ⇒ same component instance and its local state/refs are preserved; index-as-key under a reordering operation ⇒ React matches by position, not identity, and rows silently swap the local state that belongs to them.

The actions are dispatched through `startTransition`:

```js
const runAction = useCallback((type) => {
  startTransition(() => {
    dispatch({ type });
  });
  onReport(`Reconciliación: acción "${type}" aplicada`, "accent");
}, [onReport]);
```

marking the reducer update as a non-urgent transition so React can keep the UI responsive (e.g., to the `onReport` feed update) even while re-reconciling a shuffled list.

### 4. Performance Lab — `useDeferredValue` + `useTransition` over 1,805 rows

```js
const [query, setQuery] = useState("");
const [isPending, startFilterTransition] = useTransition();
const deferredQuery = useDeferredValue(query);

const resultModel = useMemo(
  () => filterSearchDataset(SEARCH_DATASET, deferredQuery, facet),
  [deferredQuery, facet]
);
```

`buildSearchDataset()` generates 1,805 synthetic rows once at module load. Typing into the search box updates `inputValue` synchronously (so the input never feels laggy) while the *actual* filter-triggering `query` update is wrapped in `startFilterTransition`, marking it low priority. `useDeferredValue(query)` gives the expensive `filterSearchDataset` call a value that's allowed to lag behind the urgent `query`, and the UI literally displays both — "query urgente" vs "query diferida" — so the gap between them, and the `isPending` chip, make React's concurrent scheduling visible rather than theoretical. `useId()` wires the search `<label>`/`<input>` pair with a collision-safe, hydration-safe id, which matters even in a CDN-only app if this were ever server-rendered.

### 5. External stores via `useSyncExternalStore`

```js
function useViewport() {
  return useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.getSnapshot,
    viewportStore.getServerSnapshot
  );
}
```

`createViewportStore()` and `createClockStore()` are hand-rolled external stores — the viewport store subscribes to `resize` and `prefers-reduced-motion` media-query changes; the clock store ticks on a `setInterval`. Both follow the exact subscribe/getSnapshot/getServerSnapshot contract `useSyncExternalStore` requires, which is the correct, tear-free way to read mutable state that lives *outside* React (the window, a WebSocket, a third-party store) instead of syncing it into `useState` via an effect — this is the same primitive libraries like Zustand and TanStack Query build their React bindings on top of.

### 6. Stability Sandbox — a class-based `ErrorBoundary`

```js
class DemoErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    this.props.onReport(`ErrorBoundary capturó: ${error.message}`, "warn");
  }
  render() {
    if (this.state.error) { return html`<div>...reset button...</div>`; }
    return this.props.children;
  }
}
```

React still has no hook-based equivalent for catching render errors, so this is a deliberate, correct use of a class component in an otherwise fully-hooks codebase. `CrashySnippet` throws synchronously during render when `explode` is `true`; `StabilitySandbox` remounts the boundary by bumping a `key` (`instanceKey`) rather than mutating boundary state directly, since an error boundary that has caught an error has no built-in "try again" — remounting via key is the idiomatic reset.

### 7. Lazy Checklist Panel — `React.lazy` + `Suspense`

```js
const LazyChecklistPanel = lazy(
  () => new Promise((resolve) => setTimeout(() => resolve({ default: ChecklistPanel }), 600))
);
```

`ChecklistPanel` is wrapped so its "module" only resolves after a simulated 600ms fetch, and `StatusRail` renders it inside a `<Suspense fallback=...>` boundary with a skeleton line — a minimal, dependency-free stand-in for real code-splitting (`React.lazy(() => import('./ChecklistPanel'))` in a bundler-based app) that still demonstrates the actual Suspense contract: a thrown promise pauses rendering of that subtree until it resolves, and the nearest boundary shows its fallback in the meantime.

## Getting Started

No install step and no `package.json` — the app is three static files that import React from a CDN at runtime.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`. An internet connection is required for the CDN-hosted `react`, `react-dom`, `htm`, and Google Fonts.

## Keyboard Shortcuts

- `1`–`5` — jump to a concept (`useConceptHotkeys`, ignores keystrokes while focused in a text input)
- `G` — jump to the interactive labs section

## Further Reading / Related Repos

Part of a broader series of hands-on React repositories by [Cristian Sifuentes](https://github.com/CristianSifuentes):

- [ACHooks](https://github.com/CristianSifuentes/ACHooks)
- [CRUP](https://github.com/CristianSifuentes/CRUP)
- [POptimizationCodeSplitting-](https://github.com/CristianSifuentes/POptimizationCodeSplitting-)
- [RCP](https://github.com/CristianSifuentes/RCP)
- [ILGState-](https://github.com/CristianSifuentes/ILGState-)
- [ATypeScript](https://github.com/CristianSifuentes/ATypeScript)
- [SAPatterns](https://github.com/CristianSifuentes/SAPatterns)
- [tsconfig_](https://github.com/CristianSifuentes/tsconfig_)
- [rxt-mastery_](https://github.com/CristianSifuentes/rxt-mastery_)
- [React-State-Data-Management](https://github.com/CristianSifuentes/React-State-Data-Management)
- [Architectural-Server-Side-Paradigms](https://github.com/CristianSifuentes/Architectural-Server-Side-Paradigms)
- [React-Essential-2026-Skills](https://github.com/CristianSifuentes/React-Essential-2026-Skills)
- [React-Advanced-Patterns-Performance](https://github.com/CristianSifuentes/React-Advanced-Patterns-Performance)
- [agentReact-](https://github.com/CristianSifuentes/agentReact-)
- [_ReactHooks](https://github.com/CristianSifuentes/_ReactHooks)
- [_PropDrillingReact](https://github.com/CristianSifuentes/_PropDrillingReact)
- [ReactAdvancedConceptsStudio_](https://github.com/CristianSifuentes/ReactAdvancedConceptsStudio_) (this repository)

## License

Apache License 2.0 — see [`LICENSE`](./LICENSE).
