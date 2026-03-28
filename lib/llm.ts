/**
 * Browser-side LLM via Transformers.js.
 * Prefers WebGPU when available; falls back to CPU (WASM).
 */

export interface LLMModelOption {
  id: string;
  label: string;
  description: string;
  size?: string;
}

export const LLM_MODELS: LLMModelOption[] = [
  {
    id: 'onnx-community/Qwen3-0.6B-ONNX',
    label: 'Qwen3 0.6B',
    description: 'Qwen3 0.6B ONNX, tarayıcıda çalışır',
    size: '~300MB',
  },
];

/** Progress info for UI: phase, status text, and optional 0-100 progress (null = indeterminate) */
export interface AnalysisProgressDetail {
  phase: 'model' | 'generate';
  status: string;
  progress: number | null;
  loaded?: number;
  total?: number;
}

export type AnalysisProgressCallback = (detail: AnalysisProgressDetail) => void;

export async function supportsWebGPU(): Promise<boolean> {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const gpu = nav && 'gpu' in nav ? (nav as { gpu: { requestAdapter(): Promise<unknown> } }).gpu : null;
  if (!gpu) return false;
  try {
    const adapter = await gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

export type TextGenerationPipeline = Awaited<ReturnType<typeof loadTextGenerationPipeline>>;

type ProgressInfo =
  | { status: 'initiate'; name: string; file: string }
  | { status: 'download'; name: string; file: string }
  | { status: 'progress'; name: string; file: string; progress: number; loaded: number; total: number }
  | { status: 'done'; name: string; file: string }
  | { status: 'ready'; task: string; model: string };

export async function loadTextGenerationPipeline(
  modelId: string,
  progressCallback?: (info: ProgressInfo) => void
): Promise<{
  generate: (prompt: string, options?: { max_new_tokens?: number }) => Promise<string>;
}> {
  const useWebGPU = await supportsWebGPU();
  const device = useWebGPU ? 'webgpu' : 'cpu';

  const { pipeline, env } = await import('@huggingface/transformers');

  // Reduce ONNX Runtime console warnings (e.g. "VerifyEachNodeIsAssignedToAnEp").
  if (env?.backends?.onnx && typeof env.backends.onnx === 'object') {
    (env.backends.onnx as Record<string, number>).logLevel = 4; // 4 = fatal
  }

  // Suppress ORT "VerifyEachNodeIsAssignedToAnEp" warning during session creation (harmless perf hint)
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
    if (msg.includes('VerifyEachNodeIsAssignedToAnEp') || msg.includes('session_state.cc')) return;
    origWarn.apply(console, args);
  };

  type Gen = (input: string, opts?: { max_new_tokens?: number; do_sample?: boolean }) => Promise<unknown>;
  let generator: Gen;
  try {
    const raw = await pipeline(
      'text-generation',
      modelId,
      {
        device,
        dtype: 'q4f16',
        progress_callback: progressCallback ?? undefined,
        session_options: {
          logSeverityLevel: 4,
        } as import('onnxruntime-common').InferenceSession.SessionOptions,
      }
    );
    generator = raw as unknown as Gen;
  } finally {
    console.warn = origWarn;
  }

  return {
    generate: async (prompt: string, options?: { max_new_tokens?: number }) => {
      const out = (await generator(prompt, {
        max_new_tokens: options?.max_new_tokens ?? 1024,
        do_sample: false,
      })) as unknown;
      const first = Array.isArray(out) ? out[0] : out;
      const text = first && typeof first === 'object' && 'generated_text' in first
        ? (first as { generated_text: string }).generated_text
        : typeof out === 'string'
          ? out
          : String(out);
      return text ?? '';
    },
  };
}

export async function generateAnalysis(
  modelId: string,
  prompt: string,
  onProgress?: AnalysisProgressCallback
): Promise<string> {
  let lastProgressHadDownload = false;

  onProgress?.({ phase: 'model', status: 'Model hazırlanıyor...', progress: null });

  const pipe = await loadTextGenerationPipeline(modelId, (info: ProgressInfo) => {
    if (info.status === 'initiate') {
      onProgress?.({ phase: 'model', status: 'Model hazırlanıyor...', progress: null });
    } else if (info.status === 'download') {
      lastProgressHadDownload = true;
      onProgress?.({ phase: 'model', status: 'Model indiriliyor...', progress: null });
    } else if (info.status === 'progress') {
      lastProgressHadDownload = true;
      onProgress?.({
        phase: 'model',
        status: `Model indiriliyor... %${Math.round(info.progress)}`,
        progress: info.progress,
        loaded: info.loaded,
        total: info.total,
      });
    } else if (info.status === 'done') {
      if (lastProgressHadDownload) {
        onProgress?.({ phase: 'model', status: 'Model indiriliyor...', progress: null });
      } else {
        onProgress?.({ phase: 'model', status: 'Model yükleniyor (önbellekten)...', progress: null });
      }
    } else if (info.status === 'ready') {
      onProgress?.({ phase: 'model', status: 'Model hazır.', progress: 100 });
    }
  });

  onProgress?.({ phase: 'generate', status: 'Analiz üretiliyor...', progress: null });
  const text = await pipe.generate(prompt, { max_new_tokens: 2048 });
  onProgress?.({ phase: 'generate', status: 'Tamamlandı.', progress: 100 });
  return text;
}
