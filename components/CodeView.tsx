'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { JkirCollection } from '../hooks/useCollections';

interface CodeViewProps {
    file: JkirCollection | null;
    onContentChange: (content: string) => void;
    onJsonParse: (data: unknown) => void;
}

const CodeView: React.FC<CodeViewProps> = ({ file, onContentChange, onJsonParse }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);

    // Load content when file changes
    useEffect(() => {
        if (file && file.type === 'file') {
            const content = file.content || '{}';
            setInputValue(content);
            setError(null);

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

    // Sync scroll between textarea and gutter
    const handleScroll = useCallback(() => {
        if (textareaRef.current && gutterRef.current) {
            gutterRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, []);

    const lineCount = useMemo(() => {
        return inputValue.split('\n').length;
    }, [inputValue]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setError(null);
        onContentChange(value);

        try {
            const parsed = JSON.parse(value);
            onJsonParse(parsed);
        } catch {
            // Don't set error while typing
        }
    }, [onContentChange, onJsonParse]);

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

            try {
                const parsed = JSON.parse(text);
                onJsonParse(parsed);
            } catch {
                // pasted content may not be valid JSON yet
            }
        } catch (e) {
            console.error('Clipboard access denied:', e);
            setError('Pano erişimi reddedildi. Lütfen manuel olarak yapıştırın.');
        }
    }, [onContentChange, onJsonParse]);

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

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = inputValue.substring(0, start) + '  ' + inputValue.substring(end);
            setInputValue(newValue);
            onContentChange(newValue);
            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            });
        }
    }, [inputValue, onContentChange]);

    if (!file) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h5>Code Editör</h5>
                <p className="text-muted">Sol panelden bir dosya seçerek düzenlemeye başlayın</p>
            </div>
        );
    }

    if (file.type === 'folder') {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📁</div>
                <h5>{file.name}</h5>
                <p className="text-muted">{file.children?.length || 0} öğe içeriyor</p>
            </div>
        );
    }

    return (
        <div className="code-view code-view-editable">
            {/* Toolbar */}
            <div className="code-editor-toolbar">
                <div className="file-name-display">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.name}</span>
                </div>
                <div className="code-editor-actions">
                    <button className="code-toolbar-btn" onClick={handlePaste} title="Panodan Yapıştır">
                        <span>📋</span> Yapıştır
                    </button>
                    <button className="code-toolbar-btn primary" onClick={handleFormat} title="Format & Görüntüle">
                        <span>✨</span> Format
                    </button>
                    <button className="code-toolbar-btn" onClick={handleMinify} title="Minify (Sıkıştır)">
                        <span>📦</span> Minify
                    </button>
                    <button className="code-toolbar-btn" onClick={handleCopy} title="Kopyala">
                        <span>📄</span> Kopyala
                    </button>
                    <button className="code-toolbar-btn danger" onClick={handleClear} title="Temizle">
                        <span>🗑️</span> Temizle
                    </button>
                </div>
            </div>

            {/* Simple Editor */}
            <div className="code-editor-container">
                <div className="code-gutter" ref={gutterRef}>
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i} className="line-num">{i + 1}</div>
                    ))}
                </div>
                <textarea
                    ref={textareaRef}
                    className="code-simple-textarea"
                    value={inputValue}
                    onChange={handleChange}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    placeholder={`JSON verisi buraya yazın...\n\n{\n  "name": "Test",\n  "version": "1.0"\n}`}
                />
            </div>

            {/* Error bar */}
            {error && (
                <div className="code-editor-error">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
};

export default CodeView;
