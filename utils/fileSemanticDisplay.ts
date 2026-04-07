import type { DocumentRole, JkirCollection, ResponseVariant } from '../hooks/useCollections';

/**
 * Dosya adından Req/Res çıkarımı (ör. create-order-request → request, validate_response → response).
 * Migrasyon tüm dosyaları "response" kaydettiğinde bile ağaçta doğru rozet görünsün.
 */
export function inferDocumentRoleFromFileName(fileName: string): DocumentRole | null {
  const lower = fileName.toLowerCase();
  const baseName = lower.replace(/\.(json|xml|js)$/i, '');
  const parts = baseName.split(/[-_.]+/).filter(Boolean);

  const hasRequest = parts.includes('request');
  const hasResponse = parts.includes('response');

  if (hasRequest && !hasResponse) return 'request';
  if (hasResponse && !hasRequest) return 'response';
  if (hasRequest && hasResponse) {
    const iReq = lower.indexOf('request');
    const iRes = lower.indexOf('response');
    if (iReq >= 0 && iRes >= 0) return iReq <= iRes ? 'request' : 'response';
    return 'response';
  }

  return null;
}

export function getDisplayDocumentRole(item: JkirCollection): DocumentRole {
  if (item.type !== 'file') return 'response';
  const inferred = inferDocumentRoleFromFileName(item.name);
  if (inferred != null) return inferred;
  return item.documentRole ?? 'response';
}

export function getDisplayResponseVariant(item: JkirCollection): ResponseVariant {
  return item.responseVariant ?? 'success';
}

export function isXmlFile(item: JkirCollection): boolean {
  return item.fileType === 'xml' || item.name.toLowerCase().endsWith('.xml');
}

/** Tooltip / erişilebilirlik için tam açıklama */
export function getSemanticDescription(item: JkirCollection): string {
  if (item.type !== 'file') return '';
  const fmt = isXmlFile(item) ? 'XML' : 'JSON';
  const role = getDisplayDocumentRole(item);
  const variant = getDisplayResponseVariant(item);
  const roleTr = role === 'request' ? 'İstek (Request)' : 'Yanıt (Response)';
  const varTr =
    variant === 'success' ? 'Başarı' : variant === 'error' ? 'Hata' : 'İş kuralı hatası';
  const src = inferDocumentRoleFromFileName(item.name) != null ? ' · Rol dosya adından' : '';
  return `${fmt} · ${roleTr} · ${varTr}${src}`;
}
