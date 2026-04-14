# Coding Conventions

**Analysis Date:** 2026-04-14

## Naming Patterns

**Files:**
- `PascalCase.tsx` for React Components
- `camelCase.ts` for utilities and hooks

**Functions:**
- `camelCase` for utilities (`generateAnalysis`, `objectToXml`)

**Types/Interfaces:**
- `PascalCase` interface names (`LLMModelOption`, `AnalysisProgressDetail`)

## Code Style

**Formatting:**
- Built-in Prettier / standard rules

**Linting:**
- ESLint (via `eslint.config.mjs`)
- Strict TypeScript constraints (`strict: true` in `tsconfig.json`)

## Import Organization

**Order:**
1. React core imports (`useState`, `useCallback`)
2. Local components (`../components/...`)
3. Local hooks (`../hooks/...`)
4. Local utilities (`../utils/...`)

## Error Handling

**Patterns:**
- Soft fallback `try/catch` observed in `app/page.tsx` during XML/JSON parsing fallback

## Logging

**Framework:** `console`

**Patterns:**
- Console warnings re-written in `lib/llm.ts` to suppress aggressive ONNX warnings.

## Comments

**When to Comment:**
- Minimal, generally focused on complex parts like WebGPU / ONNX suppressions
- Section delimiters in large component bodies (`// Split editor state`)

## Module Design

**Exports:**
- Named exports for configuration structs (`export const LLM_MODELS`)
- Default exports for main components (`export default function Home()`)

---

*Convention analysis: 2026-04-14*
