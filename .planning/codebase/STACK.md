# Technology Stack

**Analysis Date:** 2026-04-14

## Languages

**Primary:**
- TypeScript 5 - Used throughout the application source
- JavaScript - Used in configuration files (`eslint.config.mjs`, `postcss.config.mjs`)

**Secondary:**
- CSS - Used in `app/globals.css`
- HTML - Included within React `.tsx` files

## Runtime

**Environment:**
- Node.js (Next.js Application Runtime)

**Package Manager:**
- npm
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.1.3 - Primary application framework using the App Router (`app/`)
- React 19.2.3 - UI library

**Testing:**
- None enforced

**Build/Dev:**
- Tailwind CSS 4 - Used for styling alongside PostCSS
- ESLint 9 - Code linting and style checking

## Key Dependencies

**Critical:**
- CodeMirror 6 (`@codemirror/state`, `@codemirror/view`, etc.) - Used for the core JSON/XML code editor
- `@huggingface/transformers` (~3.8.1) - Used in `lib/llm.ts` to run local Qwen3 ONNX model for analysis

**Infrastructure:**
- Bootstrap 5.3.8 - Fallback or auxiliary styling library

## Configuration

**Environment:**
- Typescript configured via `tsconfig.json`

**Build:**
- Next.js config: `next.config.ts`
- PostCSS: `postcss.config.mjs`

## Platform Requirements

**Development:**
- React 19 / Next.js 16 compliant environment
- ONNX browser runtime capability (WASM/WebGPU)

**Production:**
- Any static Next.js production hosting

---

*Stack analysis: 2026-04-14*
