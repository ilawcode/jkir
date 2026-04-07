'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { DocumentRole, ResponseVariant } from '../hooks/useCollections';

export type CreateFileExtension = '.json' | '.xml';

export interface CreateFileModalResult {
  name: string;
  documentRole: DocumentRole;
  responseVariant: ResponseVariant;
}

const EXTENSION_OPTIONS: { value: CreateFileExtension; label: string }[] = [
  { value: '.json', label: '.json' },
  { value: '.xml', label: '.xml' },
];

function stripKnownExtension(raw: string): string {
  return raw.trim().replace(/\.(json|xml)$/i, '');
}

interface CreateFileModalProps {
  title?: string;
  onSubmit: (result: CreateFileModalResult) => void;
  onCancel: () => void;
}

const CreateFileModal: React.FC<CreateFileModalProps> = ({
  title = 'Yeni Dosya',
  onSubmit,
  onCancel,
}) => {
  const [baseName, setBaseName] = useState('new-file');
  const [extension, setExtension] = useState<CreateFileExtension>('.json');
  const [documentRole, setDocumentRole] = useState<DocumentRole>('response');
  const [responseVariant, setResponseVariant] = useState<ResponseVariant>('success');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const baseSanitized = stripKnownExtension(baseName);
  const canSubmit = baseSanitized.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const finalName = `${baseSanitized}${extension}`;
    onSubmit({
      name: finalName,
      documentRole,
      responseVariant: documentRole === 'response' ? responseVariant : 'success',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rename-modal-header">
          <h3>{title}</h3>
          <button type="button" className="window-close" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="rename-modal-body">
            <label htmlFor="create-file-name">Dosya adı</label>
            <div className="create-file-name-row">
              <input
                ref={inputRef}
                id="create-file-name"
                className="create-file-name-input"
                type="text"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="örn: data veya create-order-request"
                autoComplete="off"
              />
              <select
                id="create-file-extension"
                className="create-file-extension-select"
                value={extension}
                onChange={(e) => setExtension(e.target.value as CreateFileExtension)}
                aria-label="Dosya uzantısı"
              >
                {EXTENSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label>Dosya tipi</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <label className="create-file-radio">
                  <input
                    type="radio"
                    name="documentRole"
                    checked={documentRole === 'request'}
                    onChange={() => setDocumentRole('request')}
                  />
                  <span>Request</span>
                </label>
                <label className="create-file-radio">
                  <input
                    type="radio"
                    name="documentRole"
                    checked={documentRole === 'response'}
                    onChange={() => setDocumentRole('response')}
                  />
                  <span>Response</span>
                </label>
              </div>
            </div>

            {documentRole === 'response' && (
              <div style={{ marginTop: '12px' }}>
                <label>Response türü</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  <label className="create-file-radio">
                    <input
                      type="radio"
                      name="responseVariant"
                      checked={responseVariant === 'success'}
                      onChange={() => setResponseVariant('success')}
                    />
                    <span>Success</span>
                  </label>
                  <label className="create-file-radio">
                    <input
                      type="radio"
                      name="responseVariant"
                      checked={responseVariant === 'error'}
                      onChange={() => setResponseVariant('error')}
                    />
                    <span>Error</span>
                  </label>
                  <label className="create-file-radio">
                    <input
                      type="radio"
                      name="responseVariant"
                      checked={responseVariant === 'businessError'}
                      onChange={() => setResponseVariant('businessError')}
                    />
                    <span>Business Error</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="rename-modal-footer">
            <button type="button" className="btn-cancel-modal" onClick={onCancel}>
              İptal
            </button>
            <button type="submit" className="btn-save-modal" disabled={!canSubmit}>
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFileModal;
