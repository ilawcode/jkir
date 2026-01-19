'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { generatePojoFilesFromMultiple, PojoStyle, GeneratedFile } from '../utils/pojoGenerator';
import JSZip from 'jszip';

interface PojoModalProps {
  visible: boolean;
  files: { name: string; content: string }[];
  onClose: () => void;
}

const PojoModal: React.FC<PojoModalProps> = ({ visible, files, onClose }) => {
  const [style, setStyle] = useState<PojoStyle>('record');
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const generatedFiles = useMemo(() => {
    if (!visible || files.length === 0) return [];
    return generatePojoFilesFromMultiple(files, style);
  }, [visible, files, style]);

  // Set first file as selected when files change
  useMemo(() => {
    if (generatedFiles.length > 0 && !selectedFile) {
      setSelectedFile(generatedFiles[0].fileName);
    }
  }, [generatedFiles, selectedFile]);

  const selectedFileData = useMemo(() => {
    return generatedFiles.find(f => f.fileName === selectedFile) || null;
  }, [generatedFiles, selectedFile]);

  const handleCopy = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }, []);

  const handleDownload = useCallback((fileName: string, code: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadAllAsZip = useCallback(async () => {
    const zip = new JSZip();
    
    // Create a folder structure
    const pojoFolder = zip.folder('pojo');
    
    for (const file of generatedFiles) {
      pojoFolder?.file(file.fileName, file.code);
    }

    // Generate the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Download
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pojo-classes.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedFiles]);

  // Reset selected file when modal closes
  const handleClose = useCallback(() => {
    setSelectedFile(null);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="pojo-modal pojo-modal-v2" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pojo-modal-header">
          <div className="pojo-modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" />
              <path d="M9 9h6v6H9z" />
              <path d="M4 9h5M15 9h5M4 15h5M15 15h5M9 4v5M9 15v5M15 4v5M15 15v5" />
            </svg>
            <h3>Java POJO Generator</h3>
            <span className="file-count">{generatedFiles.length} class</span>
          </div>
          <button className="window-close" onClick={handleClose}>×</button>
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
            <button className="action-btn action-btn-primary" onClick={handleDownloadAllAsZip}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Tümünü ZIP İndir
            </button>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="pojo-modal-content">
          {/* File Tree */}
          <div className="pojo-file-tree">
            <div className="file-tree-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>pojo/</span>
            </div>
            <div className="file-tree-list">
              {generatedFiles.map((file) => (
                <button
                  key={file.fileName}
                  className={`file-tree-item ${selectedFile === file.fileName ? 'active' : ''}`}
                  onClick={() => setSelectedFile(file.fileName)}
                  title={`Source: ${file.sourceFile}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span className="file-name">{file.fileName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code View */}
          <div className="pojo-code-view">
            {selectedFileData ? (
              <>
                <div className="pojo-code-header">
                  <div className="code-file-info">
                    <span className="code-filename">{selectedFileData.fileName}</span>
                    <span className="code-source">from {selectedFileData.sourceFile}</span>
                  </div>
                  <div className="code-actions">
                    <button
                      className={`code-action-btn ${copied ? 'copied' : ''}`}
                      onClick={() => handleCopy(selectedFileData.code)}
                      title="Kopyala"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      {copied ? 'Kopyalandı!' : 'Kopyala'}
                    </button>
                    <button
                      className="code-action-btn"
                      onClick={() => handleDownload(selectedFileData.fileName, selectedFileData.code)}
                      title="İndir"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      İndir
                    </button>
                  </div>
                </div>
                <pre className="pojo-code">
                  <code>{selectedFileData.code}</code>
                </pre>
              </>
            ) : (
              <div className="pojo-empty">
                <p>Dosya seçin</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pojo-modal-footer">
          <span className="pojo-info">
            {generatedFiles.length} Java dosyası oluşturuldu
          </span>
          <button className="btn-close-modal" onClick={handleClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default PojoModal;
