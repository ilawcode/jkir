# Codebase Structure

**Analysis Date:** 2026-04-14

## Directory Layout

```
/
├── app/          # Next.js app router entrypoints and globals
├── components/   # React visual and stateful components
├── docs/         # Documentation
├── hooks/        # React hooks for logic and local state
├── lib/          # External integrations handlers (e.g. LLM)
├── public/       # Static assets
└── utils/        # Parsing and data export functional helpers
```

## Directory Purposes

**app:**
- Purpose: Next.js routing and main page wiring
- Contains: `.tsx` and `.css` Next.js specific files
- Key files: `app/page.tsx`, `app/globals.css`

**components:**
- Purpose: Modular ui components forming the editor layout and Modals
- Contains: React `.tsx` files
- Key files: `SplitCodeView.tsx`, `CollectionExplorer.tsx`

**hooks:**
- Purpose: Encapsulation of complex React states
- Contains: `.ts` React hooks files
- Key files: `useCollections.ts`

**lib:**
- Purpose: Bridging heavy integration logics
- Contains: `.ts` modules
- Key files: `llm.ts`

**utils:**
- Purpose: Pure calculation mechanisms (Parsing, Exporting)
- Contains: `.ts` utilities
- Key files: `xmlParser.ts`

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Main SPA entry point

**Configuration:**
- `package.json`: NPM package config
- `next.config.ts`: Next.js configuration

**Core Logic:**
- `hooks/useCollections.ts`: Core context definitions for file and folder states

## Naming Conventions

**Files:**
- PascalCase: React components (e.g., `CodeView.tsx`)
- camelCase: Hooks and utilities (e.g., `useCollections.ts`, `xmlParser.ts`)

## Where to Add New Code

**New Feature:**
- Primary code: `components/[FeatureName].tsx`
- Tests: Not applicable

**New Component/Module:**
- Implementation: `components/[ComponentName].tsx`

**Utilities:**
- Shared helpers: `utils/[helperName].ts`

---

*Structure analysis: 2026-04-14*
