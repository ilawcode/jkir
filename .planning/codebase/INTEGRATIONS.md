# External Integrations

**Analysis Date:** 2026-04-14

## APIs & External Services

**Local ML Models:**
- Qwen3 0.6B ONNX - Loaded via `@huggingface/transformers` in `lib/llm.ts`. Runs completely locally in browser via WebGPU/WASM.

## Data Storage

**Databases:**
- None detected.

**File Storage:**
- Local filesystem only (`localStorage` used for collections state via custom hooks)

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Browser console logging.

## CI/CD & Deployment

**Hosting:**
- Next.js default Vercel or similar compatible host

**CI Pipeline:**
- None

## Environment Configuration

**Required env vars:**
- None detected.

**Secrets location:**
- None required.

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-04-14*
