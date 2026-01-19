'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { JkirCollection } from '../hooks/useCollections';

interface FileEditorProps {
  file: JkirCollection | null;
  onContentChange: (content: string) => void;
  onJsonParse: (data: unknown) => void;
}

const FileEditor: React.FC<FileEditorProps> = ({
  file,
  onContentChange,
  onJsonParse,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load content when file changes
  useEffect(() => {
    if (file && file.type === 'file') {
      const content = file.content || '{}';
      setInputValue(content);
      setError(null);
      
      // Try to parse and send to parent
      try {
        const parsed = JSON.parse(content);
        onJsonParse(parsed);
      } catch {
        onJsonParse(null);
      }
    } else {
      setInputValue('');
      setError(null);
      onJsonParse(null);
    }
  }, [file?.id]);

  const handleFormat = useCallback(() => {
    if (!inputValue.trim()) {
      setError('Lütfen JSON verisi girin');
      onJsonParse(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setInputValue(formatted);
      setError(null);
      onJsonParse(parsed);
      onContentChange(formatted);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
      setError(`Geçersiz JSON: ${errorMessage}`);
      onJsonParse(null);
    }
  }, [inputValue, onJsonParse, onContentChange]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setError(null);
    onJsonParse(null);
    onContentChange('');
  }, [onJsonParse, onContentChange]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
      setError(null);
      onContentChange(text);
    } catch (e) {
      console.error('Clipboard access denied:', e);
      setError('Pano erişimi reddedildi. Lütfen manuel olarak yapıştırın.');
    }
  }, [onContentChange]);

  const handleMinify = useCallback(() => {
    if (!inputValue.trim()) {
      setError('Lütfen JSON verisi girin');
      return;
    }

    try {
      const parsed = JSON.parse(inputValue);
      const minified = JSON.stringify(parsed);
      setInputValue(minified);
      setError(null);
      onContentChange(minified);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
      setError(`Geçersiz JSON: ${errorMessage}`);
    }
  }, [inputValue, onContentChange]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inputValue);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }, [inputValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);
    onContentChange(value);
  }, [onContentChange]);

  if (!file) {
    return (
      <div className="file-editor-empty">
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <p>Düzenlemek için bir dosya seçin</p>
          <p className="text-muted small">Sol taraftan dosya seçebilir veya yeni dosya oluşturabilirsiniz</p>
        </div>
      </div>
    );
  }

  if (file.type === 'folder') {
    return (
      <div className="file-editor-empty">
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p>{file.name}</p>
          <p className="text-muted small">
            {file.children?.length || 0} öğe içeriyor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-editor">
      {/* Toolbar */}
      <div className="file-editor-toolbar">
        <div className="file-name-display">
          <span className="file-icon">📄</span>
          <span className="file-name">{file.name}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="tab-navigation d-flex align-items-center">
        <button
          className="tab-btn"
          onClick={handlePaste}
          title="Panodan Yapıştır"
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Yapıştır</span>
        </button>
        <button
          className="tab-btn active"
          onClick={handleFormat}
          title="Format & Görüntüle"
        >
          <span className="tab-icon">✨</span>
          <span className="tab-label">Format</span>
        </button>
        <button
          className="tab-btn"
          onClick={handleMinify}
          title="Minify (Sıkıştır)"
        >
          <span className="tab-icon">📦</span>
          <span className="tab-label">Minify</span>
        </button>
        <button
          className="tab-btn"
          onClick={handleCopy}
          title="Kopyala"
        >
          <span className="tab-icon">📄</span>
          <span className="tab-label">Kopyala</span>
        </button>
        <button
          className="tab-btn ms-auto text-danger"
          onClick={handleClear}
          title="Temizle"
        >
          <span className="tab-icon">🗑️</span>
          <span className="tab-label">Temizle</span>
        </button>
      </div>

      {/* Editor Area */}
      <div className="file-editor-content">
        <textarea
          className="form-control json-textarea-clean"
          placeholder={`JSON verisi buraya yapıştırın...

Örnek:
{
  "name": "API Test",
  "version": "1.0.0"
}`}
          value={inputValue}
          onChange={handleChange}
          spellCheck={false}
        />

        {error && (
          <div className="error-message position-absolute bottom-0 start-0 w-100 p-2 bg-danger text-white bg-opacity-75" style={{ fontSize: '12px' }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditor;
