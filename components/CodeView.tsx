'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { JkirCollection } from '../hooks/useCollections';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, placeholder as cmPlaceholder } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { linter, lintGutter } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';

interface CodeViewProps {
    file: JkirCollection | null;
    onContentChange: (content: string) => void;
    onJsonParse: (data: unknown) => void;
}

// Custom light theme
const lightTheme = EditorView.theme({
    '&': {
        height: '100%',
        fontSize: '13px',
        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
    },
    '.cm-content': {
        caretColor: '#1976d2',
        padding: '8px 0',
    },
    '.cm-cursor': {
        borderLeftColor: '#1976d2',
        borderLeftWidth: '2px',
    },
    '.cm-gutters': {
        background: '#f5f5f5',
        borderRight: '1px solid #e0e0e0',
        color: '#999',
    },
    '.cm-activeLineGutter': {
        background: '#e3f2fd',
        color: '#1976d2',
    },
    '.cm-activeLine': {
        background: '#f5f9ff',
    },
    '.cm-selectionMatch': {
        background: '#b3d4fc',
    },
    '.cm-matchingBracket': {
        background: '#c8e6c9',
        outline: '1px solid #81c784',
    },
    '.cm-foldGutter .cm-gutterElement': {
        cursor: 'pointer',
        color: '#999',
        fontSize: '12px',
    },
    '.cm-tooltip': {
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    '.cm-tooltip-autocomplete': {
        '& > ul > li': {
            padding: '4px 8px',
        },
        '& > ul > li[aria-selected]': {
            background: '#e3f2fd',
            color: '#1976d2',
        },
    },
    '.cm-diagnostic-error': {
        borderLeft: '3px solid #f44336',
    },
    '.cm-diagnostic-warning': {
        borderLeft: '3px solid #ff9800',
    },
    '.cm-panels': {
        background: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
    },
    '.cm-search': {
        background: '#f5f5f5',
    },
});

const darkThemeCompartment = new Compartment();

const CodeView: React.FC<CodeViewProps> = ({ file, onContentChange, onJsonParse }) => {
    const [error, setError] = useState<string | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorViewRef = useRef<EditorView | null>(null);
    const currentFileIdRef = useRef<string | null>(null);
    const [isDark, setIsDark] = useState(false);

    // Detect theme changes
    useEffect(() => {
        const checkTheme = () => {
            const hasDark = document.documentElement.classList.contains('dark-theme') ||
                document.body.classList.contains('dark-theme');
            setIsDark(hasDark);
        };

        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Update editor theme
    useEffect(() => {
        if (editorViewRef.current) {
            editorViewRef.current.dispatch({
                effects: darkThemeCompartment.reconfigure(isDark ? oneDark : lightTheme),
            });
        }
    }, [isDark]);

    // Initialize/recreate editor when file changes
    useEffect(() => {
        if (!file || file.type !== 'file' || !editorContainerRef.current) return;

        // If same file, update content if needed
        if (editorViewRef.current && currentFileIdRef.current === file.id) {
            const currentContent = editorViewRef.current.state.doc.toString();
            if (currentContent !== (file.content || '{}')) {
                editorViewRef.current.dispatch({
                    changes: {
                        from: 0,
                        to: currentContent.length,
                        insert: file.content || '{}',
                    },
                });
            }
            return;
        }

        // Destroy old editor
        if (editorViewRef.current) {
            editorViewRef.current.destroy();
            editorViewRef.current = null;
        }

        currentFileIdRef.current = file.id;
        const content = file.content || '{}';

        // Parse initial content
        try {
            const parsed = JSON.parse(content);
            onJsonParse(parsed);
            setError(null);
        } catch {
            onJsonParse(null);
        }

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                const value = update.state.doc.toString();
                onContentChange(value);

                try {
                    const parsed = JSON.parse(value);
                    onJsonParse(parsed);
                    setError(null);
                } catch {
                    // Don't set error while typing - linter handles it
                }
            }
        });

        const state = EditorState.create({
            doc: content,
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightActiveLine(),
                history(),
                foldGutter(),
                indentOnInput(),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                highlightSelectionMatches(),
                json(),
                linter(jsonParseLinter()),
                lintGutter(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                darkThemeCompartment.of(isDark ? oneDark : lightTheme),
                cmPlaceholder('JSON verisi buraya yazın...\n\n{\n  "name": "Test",\n  "version": "1.0"\n}'),
                keymap.of([
                    ...defaultKeymap,
                    ...historyKeymap,
                    ...closeBracketsKeymap,
                    ...foldKeymap,
                    ...searchKeymap,
                    indentWithTab,
                ]),
                updateListener,
                EditorView.lineWrapping,
            ],
        });

        const view = new EditorView({
            state,
            parent: editorContainerRef.current,
        });

        editorViewRef.current = view;

        return () => {
            // Cleanup on unmount only
        };
    }, [file?.id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (editorViewRef.current) {
                editorViewRef.current.destroy();
                editorViewRef.current = null;
            }
        };
    }, []);

    const handleFormat = useCallback(() => {
        if (!editorViewRef.current) return;
        const value = editorViewRef.current.state.doc.toString();

        if (!value.trim()) {
            setError('Lütfen JSON verisi girin');
            onJsonParse(null);
            return;
        }

        try {
            const parsed = JSON.parse(value);
            const formatted = JSON.stringify(parsed, null, 2);
            editorViewRef.current.dispatch({
                changes: { from: 0, to: value.length, insert: formatted },
            });
            setError(null);
            onJsonParse(parsed);
            onContentChange(formatted);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            setError(`Geçersiz JSON: ${errorMessage}`);
            onJsonParse(null);
        }
    }, [onJsonParse, onContentChange]);

    const handleClear = useCallback(() => {
        if (!editorViewRef.current) return;
        const len = editorViewRef.current.state.doc.length;
        editorViewRef.current.dispatch({
            changes: { from: 0, to: len, insert: '' },
        });
        setError(null);
        onJsonParse(null);
        onContentChange('');
    }, [onJsonParse, onContentChange]);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!editorViewRef.current) return;
            const len = editorViewRef.current.state.doc.length;
            editorViewRef.current.dispatch({
                changes: { from: 0, to: len, insert: text },
            });
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
        if (!editorViewRef.current) return;
        const value = editorViewRef.current.state.doc.toString();

        if (!value.trim()) {
            setError('Lütfen JSON verisi girin');
            return;
        }

        try {
            const parsed = JSON.parse(value);
            const minified = JSON.stringify(parsed);
            editorViewRef.current.dispatch({
                changes: { from: 0, to: value.length, insert: minified },
            });
            setError(null);
            onContentChange(minified);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            setError(`Geçersiz JSON: ${errorMessage}`);
        }
    }, [onContentChange]);

    const handleCopy = useCallback(async () => {
        if (!editorViewRef.current) return;
        try {
            const text = editorViewRef.current.state.doc.toString();
            await navigator.clipboard.writeText(text);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }, []);

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

            {/* CodeMirror Editor */}
            <div className="code-editor-container codemirror-wrapper" ref={editorContainerRef} />

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
