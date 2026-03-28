# Geliştirme Notları – Nerede Kaldık

**Son güncelleme:** 2026-03-28  
**Branch:** `feature/add-local-llm`

---

## Tamamlanan (özet)

- Local LLM analiz akışı (Qwen3 ONNX, WebGPU/CPU), klasör “Analiz Üret”, Analiz sekmesi, Confluence Markdown + önizleme.
- Dosya oluşturma: Request/Response + Success/Error/Business Error; migrasyon (mevcut dosyalar response+success).
- Model indirme / analiz için durum metni + progress bar (`page.tsx`).
- ONNX konsol uyarısı için `lib/llm.ts`: `env.backends.onnx.logLevel`, `session_options.logSeverityLevel`, geçici `console.warn` filtresi.
- **Koleksiyon ağacında rozetler:** Her dosyada JSON/XML, Req/Res, (Response ise) OK/Err/Biz — `CollectionItem.tsx` + `globals.css`.
- **Dokümantasyon:** `docs/sunum-direktor-urun-ve-vizyon.md` (yönetici sunumu).

---

## Sırada / önerilen devam

1. **Manuel test:** Analiz üretimi (ilk indirme, cache, WebGPU/CPU).
2. **İsteğe bağlı:** `lib/llm.ts` içinde `LLM_MODELS` listesine ek ONNX modelleri.
3. **Merge:** `feature/add-local-llm` → `main` ve `git push` (ortam izin veriyorsa).

---

## Önemli dosyalar

| Ne | Dosya |
|----|--------|
| LLM | `lib/llm.ts` |
| Analiz prompt | `utils/analysisPrompt.ts` |
| Koleksiyon + migrasyon | `hooks/useCollections.ts` |
| Ağaç + rozetler | `components/CollectionItem.tsx` |
| Analiz UI | `components/AnalysisView.tsx`, `AnalysisConfigModal.tsx` |
| Ana akış | `app/page.tsx` |

---

*Bu dosyayı açarak “nerede kaldık / neye devam” hızlıca hatırlanabilir.*
