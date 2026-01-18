'use client';

import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';

const STORAGE_KEY = 'json-viewer-data';

interface JsonInputProps {
    onJsonParse: (data: unknown) => void;
    externalValue?: string;
}

export interface JsonInputRef {
    setValue: (value: string) => void;
    getValue: () => string;
}

const JsonInput = forwardRef<JsonInputRef, JsonInputProps>(({ onJsonParse, externalValue }, ref) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setInputValue(saved);
            try {
                const parsed = JSON.parse(saved);
                onJsonParse(parsed);
            } catch {
                // Invalid JSON in storage, just load the text
            }
        }
    }, []);

    // Update from external value (when TreeView edit happens)
    useEffect(() => {
        if (externalValue !== undefined && externalValue !== inputValue) {
            setInputValue(externalValue);
            saveToStorage(externalValue);
        }
    }, [externalValue]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        setValue: (value: string) => {
            setInputValue(value);
            saveToStorage(value);
        },
        getValue: () => inputValue,
    }));

    const saveToStorage = (value: string) => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    };

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
            saveToStorage(formatted);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            setError(`Geçersiz JSON: ${errorMessage}`);
            onJsonParse(null);
        }
    }, [inputValue, onJsonParse]);

    const handleClear = useCallback(() => {
        setInputValue('');
        setError(null);
        onJsonParse(null);
        localStorage.removeItem(STORAGE_KEY);
    }, [onJsonParse]);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInputValue(text);
            setError(null);
            saveToStorage(text);
        } catch (e) {
            console.error('Clipboard access denied:', e);
            setError('Pano erişimi reddedildi. Lütfen manuel olarak yapıştırın.');
        }
    }, []);

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
            saveToStorage(minified);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            setError(`Geçersiz JSON: ${errorMessage}`);
        }
    }, [inputValue]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(inputValue);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }, [inputValue]);

    return (
        <div className="view-panel h-100 d-flex flex-column border-0 rounded-0">
            {/* Horizontal Action Bar - Styled like tabs */}
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
            <div className="tab-content flex-grow-1 p-0 position-relative d-flex flex-column">
                <textarea
                    className="form-control json-textarea-clean flex-grow-1 border-0"
                    placeholder={`JSON verisi buraya yapıştırın...

Örnek:
{
  "name": "API Test",
  "version": "1.0.0"
}`}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(null);
                        saveToStorage(e.target.value);
                    }}
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
});

JsonInput.displayName = 'JsonInput';

export default JsonInput;
