# Codebase Concerns

**Analysis Date:** 2026-04-14

## Tech Debt

**`app/page.tsx` Complexity:**
- Issue: Contains >400 lines handling heavy layout, state initialization, and component rendering logic for the main dashboard.
- Files: `app/page.tsx`
- Impact: Increased maintenance difficulty as new Modals or Views are added.
- Fix approach: Refactor editor handlers and state wrappers into modular sub-components or unified context providers.

## Known Bugs

**Memory Requirements for LLM:**
- Symptoms: Lower-end browsers may crash fetching the ONNX Qwen3 0.6B model which requires ~300MB downloads
- Files: `lib/llm.ts`
- Workaround: Explicit initialization and user-guided UI loading bars (currently somewhat implemented but requires robust UX handling).

## Safety/Testing Limits

**Complete Lack of Testing:**
- Issue: No unit, integration, or e2e test layer is present.
- Impact: Refactoring parsing `utils/*.ts`, hooking the `hooks/useCollections` logic might lead to fatal breakages for file manipulations.
- Fix approach: Introduce Vitest and write unit tests for `utils/` followed by testing `useCollections`.

---

*Concerns audit: 2026-04-14*
