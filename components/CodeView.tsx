'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface CodeViewProps {
    data: unknown;
    onJsonParse: (data: unknown) => void;
}

const CodeView: React.FC<CodeViewProps> = ({ data, onJsonParse }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Sync from external data changes (e.g. TreeView edits)
    useEffect(() => {
        if (data !== null && data !== undefined) {
            const formatted = JSON.stringify(data, null, 2);
            if (formatted !== inputValue) {
                setInputValue(formatted);
                setError(null);
            }
        }
    }, [data]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setError(null);

        // Auto-parse on change
        if (!value.trim()) {
            onJsonParse(null);
            return;
        }
        try {
            const parsed = JSON.parse(value);
            onJsonParse(parsed);
        } catch {
            // Don't clear parsed data on invalid intermediate edits
        }
    }, [onJsonParse]);

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
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            setError(`Geçersiz JSON: ${errorMessage}`);
            onJsonParse(null);
        }
    }, [inputValue, onJsonParse]);

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
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            setError(`Geçersiz JSON: ${errorMessage}`);
        }
    }, [inputValue]);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInputValue(text);
            setError(null);
            try {
                const parsed = JSON.parse(text);
                onJsonParse(parsed);
            } catch {
                // pasted text may not be valid JSON yet
            }
        } catch (e) {
            console.error('Clipboard access denied:', e);
            setError('Pano erişimi reddedildi. Lütfen manuel olarak yapıştırın.');
        }
    }, [onJsonParse]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(inputValue);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }, [inputValue]);

    const handleClear = useCallback(() => {
        setInputValue('');
        setError(null);
        onJsonParse(null);
    }, [onJsonParse]);

    return (
        <div className="code-view-editor h-100 d-flex flex-column">
            {/* Toolbar */}
            <div className="tab-navigation d-flex align-items-center">
                <button className="tab-btn" onClick={handlePaste} title="Panodan Yapıştır">
                    <span className="tab-icon">📋</span>
                    <span className="tab-label">Yapıştır</span>
                </button>
                <button className="tab-btn active" onClick={handleFormat} title="Format & Görüntüle">
                    <span className="tab-icon">✨</span>
                    <span className="tab-label">Format</span>
                </button>
                <button className="tab-btn" onClick={handleMinify} title="Minify (Sıkıştır)">
                    <span className="tab-icon">📦</span>
                    <span className="tab-label">Minify</span>
                </button>
                <button className="tab-btn" onClick={handleCopy} title="Kopyala">
                    <span className="tab-icon">📄</span>
                    <span className="tab-label">Kopyala</span>
                </button>
                <button className="tab-btn ms-auto text-danger" onClick={handleClear} title="Temizle">
                    <span className="tab-icon">🗑️</span>
                    <span className="tab-label">Temizle</span>
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-grow-1 p-0 position-relative d-flex flex-column">
                <textarea
                    className="form-control json-textarea-clean flex-grow-1 border-0"
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

export default CodeView;
