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

export async function loadTextGenerationPipeline(modelId: string): Promise<{
  generate: (prompt: string, options?: { max_new_tokens?: number }) => Promise<string>;
}> {
  const useWebGPU = await supportsWebGPU();
  const device = useWebGPU ? 'webgpu' : 'cpu';

  const { pipeline } = await import('@huggingface/transformers');

  const generator = await pipeline('text-generation', modelId, {
    device,
    dtype: 'q4f16',
  });

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
  onProgress?: (status: string) => void
): Promise<string> {
  onProgress?.('Model yükleniyor...');
  const pipe = await loadTextGenerationPipeline(modelId);
  onProgress?.('Analiz üretiliyor...');
  const text = await pipe.generate(prompt, { max_new_tokens: 2048 });
  return text;
}
