'use client';

import React, { useState } from 'react';
import type { JkirCollection } from '../hooks/useCollections';
import { LLM_MODELS } from '../lib/llm';

interface AnalysisConfigModalProps {
  visible: boolean;
  folder: JkirCollection | null;
  onStart: (modelId: string) => void;
  onClose: () => void;
}

const AnalysisConfigModal: React.FC<AnalysisConfigModalProps> = ({
  visible,
  folder,
  onStart,
  onClose,
}) => {
  const [selectedModelId, setSelectedModelId] = useState(LLM_MODELS[0]?.id ?? '');
  const [isStarting, setIsStarting] = useState(false);

  if (!visible) return null;

  const handleStart = async () => {
    if (!selectedModelId) return;
    setIsStarting(true);
    try {
      onStart(selectedModelId);
      onClose();
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rename-modal" style={{ minWidth: '320px' }} onClick={(e) => e.stopPropagation()}>
        <div className="rename-modal-header">
          <h3>Analiz Üret</h3>
          <button type="button" className="window-close" onClick={onClose}>×</button>
        </div>
        <div className="rename-modal-body">
          {folder && (
            <p style={{ marginBottom: '12px', fontSize: '14px' }}>
              Klasör: <strong>{folder.name}</strong>
            </p>
          )}
          <label htmlFor="analysis-model">LLM Modeli</label>
          <select
            id="analysis-model"
            className="analysis-model-select"
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', marginTop: '4px', borderRadius: '6px' }}
          >
            {LLM_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} {m.size ? `(${m.size})` : ''}
              </option>
            ))}
          </select>
          <p className="text-muted small" style={{ marginTop: '8px', fontSize: '12px' }}>
            WebGPU destekleniyorsa otomatik kullanılır; yoksa CPU ile çalışır.
          </p>
        </div>
        <div className="rename-modal-footer">
          <button type="button" className="btn-cancel-modal" onClick={onClose}>
            İptal
          </button>
          <button
            type="button"
            className="btn-save-modal"
            disabled={!selectedModelId || isStarting}
            onClick={handleStart}
          >
            {isStarting ? 'Başlatılıyor...' : 'Analiz Üret'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisConfigModal;
