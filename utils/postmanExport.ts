import type { JkirCollection } from '../hooks/useCollections';
import { getDisplayDocumentRole } from './fileSemanticDisplay';

const POSTMAN_SCHEMA =
  'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';

function slugSegment(name: string): string {
  const base = name.replace(/\.(json|xml|js)$/i, '');
  const s = base
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return s || 'resource';
}

function newPostmanId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function contentTypeForFile(file: JkirCollection): string {
  const xml =
    file.fileType === 'xml' || file.name.toLowerCase().endsWith('.xml');
  return xml ? 'application/xml' : 'application/json';
}

function bodyLanguage(file: JkirCollection): 'json' | 'xml' {
  const xml =
    file.fileType === 'xml' || file.name.toLowerCase().endsWith('.xml');
  return xml ? 'xml' : 'json';
}

function fileToRequestItem(
  file: JkirCollection,
  pathParts: string[]
): Record<string, unknown> {
  const role = getDisplayDocumentRole(file);
  const method = role === 'request' ? 'POST' : 'GET';
  const segs = [...pathParts, slugSegment(file.name)];
  const rawUrl = `{{baseUrl}}/${segs.join('/')}`;
  const ct = contentTypeForFile(file);
  const body = file.content ?? (bodyLanguage(file) === 'json' ? '{}' : '');

  const variant = file.responseVariant ?? 'success';
  const descParts = [
    'JKIR üzerinden dışa aktarıldı.',
    role === 'request' ? 'İstek örneği (Request).' : 'Yanıt örneği (Response).',
    `Varyant: ${variant}.`,
    'Postman: Import → bu dosyayı seçin. `baseUrl` değişkenini ortamınıza göre ayarlayın.',
  ];

  return {
    name: file.name.replace(/\.(json|xml|js)$/i, '') || file.name,
    request: {
      method,
      header: [
        {
          key: 'Content-Type',
          value: ct,
        },
      ],
      body: {
        mode: 'raw',
        raw: body,
        options: {
          raw: {
            language: bodyLanguage(file),
          },
        },
      },
      url: {
        raw: rawUrl,
        host: ['{{baseUrl}}'],
        path: segs,
      },
      description: descParts.join(' '),
    },
    response: [],
  };
}

function mapFolderChildren(
  children: JkirCollection[],
  pathParts: string[]
): Record<string, unknown>[] {
  const items: Record<string, unknown>[] = [];

  for (const child of children) {
    if (child.type === 'folder') {
      items.push({
        name: child.name,
        item: mapFolderChildren(
          child.children || [],
          [...pathParts, slugSegment(child.name)]
        ),
      });
    } else {
      items.push(fileToRequestItem(child, pathParts));
    }
  }

  return items;
}

/**
 * Seçilen klasörü Postman Collection v2.1 JSON nesnesine çevirir.
 * İç içe klasör yapısı Postman’da klasör olarak korunur.
 */
export function buildPostmanCollectionV21(
  exportRoot: JkirCollection
): Record<string, unknown> {
  if (exportRoot.type !== 'folder') {
    throw new Error('Sadece klasör dışa aktarılabilir');
  }

  const rootSlug = slugSegment(exportRoot.name);
  const basePath = [rootSlug];

  return {
    info: {
      _postman_id: newPostmanId(),
      name: exportRoot.name,
      description:
        'JKIR workspace dışa aktarımı. Her dosya bir istek olarak eklendi; URL yolu klasör yapısını yansıtır. `baseUrl` koleksiyon değişkeninde tanımlıdır.',
      schema: POSTMAN_SCHEMA,
    },
    variable: [
      {
        key: 'baseUrl',
        value: 'https://api.example.com',
        type: 'string',
      },
    ],
    item: mapFolderChildren(exportRoot.children || [], basePath),
  };
}

function safeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'jkir-collection';
}

/** Klasörü Postman’a içe aktarılabilir .postman_collection.json olarak indirir */
export function downloadPostmanCollection(exportRoot: JkirCollection): void {
  const collection = buildPostmanCollectionV21(exportRoot);
  const json = JSON.stringify(collection, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFileName(exportRoot.name)}.postman_collection.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
