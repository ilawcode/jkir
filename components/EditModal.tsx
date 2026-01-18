'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface EditModalProps {
    isOpen: boolean;
    nodeKey: string | number;
    value: unknown;
    onSave: (newValue: unknown) => void;
    onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    nodeKey,
    value,
    onSave,
    onClose,
}) => {
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(true);
    const [lineCount, setLineCount] = useState(1);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            try {
                const formatted = JSON.stringify(value, null, 2);
                setEditValue(formatted);
                setLineCount(formatted.split('\n').length);
                setError(null);
                setIsValid(true);
            } catch {
                setEditValue(String(value));
                setLineCount(1);
            }
            // Focus textarea after mount
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen, value]);

    const validateJson = useCallback((text: string): boolean => {
        try {
            JSON.parse(text);
            setError(null);
            setIsValid(true);
            return true;
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Geçersiz JSON';
            setError(errorMessage);
            setIsValid(false);
            return false;
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setEditValue(newValue);
        setLineCount(newValue.split('\n').length);
        validateJson(newValue);
    };

    const handleScroll = () => {
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const handleSave = () => {
        if (validateJson(editValue)) {
            try {
                const parsed = JSON.parse(editValue);
                onSave(parsed);
                onClose();
            } catch {
                setError('Değer kaydedilemedi');
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
        // Tab support for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = editValue.substring(0, start) + '  ' + editValue.substring(end);
                setEditValue(newValue);
                setLineCount(newValue.split('\n').length);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 2;
                }, 0);
            }
        }
    };

    const formatJson = () => {
        try {
            const parsed = JSON.parse(editValue);
            const formatted = JSON.stringify(parsed, null, 2);
            setEditValue(formatted);
            setLineCount(formatted.split('\n').length);
            setError(null);
            setIsValid(true);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Geçersiz JSON';
            setError(errorMessage);
        }
    };

    const minifyJson = () => {
        try {
            const parsed = JSON.parse(editValue);
            const minified = JSON.stringify(parsed);
            setEditValue(minified);
            setLineCount(1);
            setError(null);
            setIsValid(true);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Geçersiz JSON';
            setError(errorMessage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="editor-overlay" onClick={onClose}>
            <div
                className="editor-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Editor Header / Title Bar */}
                <div className="editor-titlebar">
                    <div className="editor-title">
                        <span className="editor-icon">📝</span>
                        <span className="editor-filename">{String(nodeKey)}</span>
                        <span className={`editor-status ${isValid ? 'valid' : 'invalid'}`}>
                            {isValid ? '● Geçerli JSON' : '● Hatalı JSON'}
                        </span>
                    </div>
                    <button className="editor-close" onClick={onClose} aria-label="Kapat">×</button>
                </div>

                {/* Editor Toolbar */}
                <div className="editor-toolbar">
                    <div className="toolbar-group">
                        <button className="toolbar-btn" onClick={formatJson} title="Formatla">
                            <span>{ }</span> Format
                        </button>
                        <button className="toolbar-btn" onClick={minifyJson} title="Sıkıştır">
                            <span>⊟</span> Minify
                        </button>
                    </div>
                    <div className="toolbar-info">
                        <span>Satır: {lineCount}</span>
                        <span>|</span>
                        <span>Ctrl+S: Kaydet</span>
                        <span>|</span>
                        <span>Esc: Kapat</span>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="editor-content">
                    <div className="line-numbers" ref={lineNumbersRef}>
                        {Array.from({ length: lineCount }, (_, i) => (
                            <div key={i + 1} className="line-number">{i + 1}</div>
                        ))}
                    </div>
                    <textarea
                        ref={textareaRef}
                        className={`editor-textarea ${error ? 'has-error' : ''}`}
                        value={editValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onScroll={handleScroll}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                    />
                </div>

                {/* Error Bar */}
                {error && (
                    <div className="editor-error">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{error}</span>
                    </div>
                )}

                {/* Editor Footer / Status Bar */}
                <div className="editor-footer">
                    <div className="footer-left">
                        <span className="footer-hint">JSON Editor</span>
                    </div>
                    <div className="footer-right">
                        <button className="btn-cancel" onClick={onClose}>
                            İptal
                        </button>
                        <button
                            className="btn-save"
                            onClick={handleSave}
                            disabled={!isValid}
                        >
                            💾 Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
