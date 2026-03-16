'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { DocumentRole, ResponseVariant } from '../hooks/useCollections';

export interface CreateFileModalResult {
  name: string;
  documentRole: DocumentRole;
  responseVariant: ResponseVariant;
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
  const [name, setName] = useState('new-file.json');
  const [documentRole, setDocumentRole] = useState<DocumentRole>('response');
  const [responseVariant, setResponseVariant] = useState<ResponseVariant>('success');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const finalName = /\.(json|xml)$/i.test(trimmed) ? trimmed : `${trimmed}.json`;
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
            <label htmlFor="create-file-name">Dosya adı (.json veya .xml)</label>
            <div className="rename-input-wrapper">
              <input
                ref={inputRef}
                id="create-file-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="örn: data.json veya config.xml"
              />
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
            <button type="submit" className="btn-save-modal" disabled={!name.trim()}>
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFileModal;
