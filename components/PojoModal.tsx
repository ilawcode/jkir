'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { generatePojo, generatePojosFromFiles, PojoStyle } from '../utils/pojoGenerator';

interface PojoModalProps {
  visible: boolean;
  files: { name: string; content: string }[];
  onClose: () => void;
}

const PojoModal: React.FC<PojoModalProps> = ({ visible, files, onClose }) => {
  const [style, setStyle] = useState<PojoStyle>('record');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const generatedPojos = useMemo(() => {
    if (!visible || files.length === 0) return [];
    return generatePojosFromFiles(files, style);
  }, [visible, files, style]);

  const handleCopy = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    const allCode = generatedPojos.map((p) => `// ${p.className}.java\n${p.code}`).join('\n\n// ========================================\n\n');
    await handleCopy(allCode);
  }, [generatedPojos, handleCopy]);

  const handleDownload = useCallback((className: string, code: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className}.java`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadAll = useCallback(() => {
    generatedPojos.forEach((pojo) => {
      handleDownload(pojo.className, pojo.code);
    });
  }, [generatedPojos, handleDownload]);

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pojo-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pojo-modal-header">
          <div className="pojo-modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" />
              <path d="M9 9h6v6H9z" />
              <path d="M4 9h5M15 9h5M4 15h5M15 15h5M9 4v5M9 15v5M15 4v5M15 15v5" />
            </svg>
            <h3>Java POJO Generator</h3>
            <span className="file-count">{files.length} dosya</span>
          </div>
          <button className="window-close" onClick={onClose}>×</button>
        </div>

        {/* Style Selector */}
        <div className="pojo-style-selector">
          <span className="style-label">Stil:</span>
          <div className="style-options">
            <button
              className={`style-btn ${style === 'record' ? 'active' : ''}`}
              onClick={() => setStyle('record')}
            >
              Record (Java 17)
            </button>
            <button
              className={`style-btn ${style === 'class' ? 'active' : ''}`}
              onClick={() => setStyle('class')}
            >
              Class
            </button>
            <button
              className={`style-btn ${style === 'lombok' ? 'active' : ''}`}
              onClick={() => setStyle('lombok')}
            >
              Lombok
            </button>
          </div>
          <div className="style-actions">
            <button className="action-btn" onClick={handleCopyAll}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {copied ? 'Kopyalandı!' : 'Tümünü Kopyala'}
            </button>
            <button className="action-btn" onClick={handleDownloadAll}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Tümünü İndir
            </button>
          </div>
        </div>

        {/* Tabs for multiple files */}
        {generatedPojos.length > 1 && (
          <div className="pojo-tabs">
            {generatedPojos.map((pojo, idx) => (
              <button
                key={idx}
                className={`pojo-tab ${activeTab === idx ? 'active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                {pojo.className}.java
              </button>
            ))}
          </div>
        )}

        {/* Code Display */}
        <div className="pojo-modal-body">
          {generatedPojos.length === 0 ? (
            <div className="pojo-empty">
              <p>Geçerli JSON dosyası bulunamadı</p>
            </div>
          ) : (
            <div className="pojo-code-container">
              <div className="pojo-code-header">
                <span className="code-filename">{generatedPojos[activeTab]?.className}.java</span>
                <div className="code-actions">
                  <button
                    className="code-action-btn"
                    onClick={() => handleCopy(generatedPojos[activeTab]?.code || '')}
                    title="Kopyala"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  <button
                    className="code-action-btn"
                    onClick={() => handleDownload(
                      generatedPojos[activeTab]?.className || 'Class',
                      generatedPojos[activeTab]?.code || ''
                    )}
                    title="İndir"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </div>
              </div>
              <pre className="pojo-code">
                <code>{generatedPojos[activeTab]?.code}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pojo-modal-footer">
          <span className="pojo-info">
            {generatedPojos.length} class oluşturuldu
          </span>
          <button className="btn-close-modal" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default PojoModal;
