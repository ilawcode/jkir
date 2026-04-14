# Architecture

**Analysis Date:** 2026-04-14

## Pattern Overview

**Overall:** Client-Side React SPA (via Next.js App Router)

**Key Characteristics:**
- Entire interaction happens on the client side (`'use client'` directive seen in page components)
- Collections and workspace context live entirely in browser local storage via React hooks
- Split pane code view using CodeMirror 6

## Layers

**UI Layer:**
- Purpose: Application routing and primary views
- Location: `app/`
- Contains: `page.tsx`, `layout.tsx`, `globals.css`

**Components Layer:**
- Purpose: Reusable application components (Views, Modals, Trees)
- Location: `components/`
- Contains: `CodeView.tsx`, `SplitCodeView.tsx`, `FlowView.tsx`, etc.

**State Management Layer:**
- Purpose: Manage the user workspace and configurations
- Location: `hooks/`
- Contains: Custom hooks such as `useCollections` and `useTheme`

**Lib / Integration Layer:**
- Purpose: Logic bridging the application to large dependencies like ONNX
- Location: `lib/`
- Contains: `llm.ts`

**Utilities Layer:**
- Purpose: Pure functional utilities for text/data parsing
- Location: `utils/`
- Contains: `xmlParser.ts`, `pojoGenerator.ts`, `postmanExport.ts`

## Data Flow

**Viewing a File:**
1. User selects a file in `CollectionExplorer.tsx`
2. `Home` component in `app/page.tsx` grabs the object via `useCollections`
3. State is passed down to `SplitCodeView.tsx` and related parsed visual views (`FlowView.tsx`, `TreeView.tsx`)
4. Data edited syncs via `handleDataChange` and triggers `updateFileContent` in the hook

**State Management:**
- Purely browser-based utilizing React `useState`/`useEffect` syncing possibly to `localStorage`

## Key Abstractions

**Workspace Structure:**
- Purpose: Represents folder and file items for JSON/XML requests
- Examples: `components/CollectionExplorer.tsx`
- Pattern: Tree-like nodes managed under `collections`

## Entry Points

**Main App Entry:**
- Location: `app/page.tsx`
- Triggers: URL `/` path load
- Responsibilities: Wraps main workspace UI layout, handles active tabs, invokes themes

## Error Handling

**Strategy:** Passive/Callback

**Patterns:**
- Using `try/catch` around `xmlParser` routines inside `handleDataChange`
- Falling back to raw object stringification on parsing failures

---

*Architecture analysis: 2026-04-14*
