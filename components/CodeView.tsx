'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { JkirCollection } from '../hooks/useCollections';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, placeholder as cmPlaceholder } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { MergeView } from '@codemirror/merge';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { linter, lintGutter, Diagnostic } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { parseXml, formatXml, minifyXml } from '../utils/xmlParser';

interface CodeViewProps {
    file: JkirCollection | null;
    onContentChange: (content: string) => void;
    onJsonParse: (data: unknown) => void;
    onClose?: () => void;
    compareContent?: string;
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

/**
 * Detect file type from the file object.
 */
function getFileType(file: JkirCollection | null): 'json' | 'xml' {
    if (!file) return 'json';
    if (file.fileType) return file.fileType;
    if (file.name.toLowerCase().endsWith('.xml')) return 'xml';
    return 'json';
}

/**
 * XML linter for CodeMirror
 */
function xmlLinter() {
    return linter((view) => {
        const diagnostics: Diagnostic[] = [];
        const content = view.state.doc.toString().trim();
        if (!content) return diagnostics;

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'application/xml');
            const parseError = doc.querySelector('parsererror');

            if (parseError) {
                const errorText = parseError.textContent || 'XML parse hatası';
                // Try to extract line/column from error message
                const lineMatch = errorText.match(/line (\d+)/i);
                const line = lineMatch ? parseInt(lineMatch[1], 10) : 1;
                const from = view.state.doc.line(Math.min(line, view.state.doc.lines)).from;
                const to = view.state.doc.line(Math.min(line, view.state.doc.lines)).to;

                diagnostics.push({
                    from,
                    to,
                    severity: 'error',
                    message: errorText.split('\n')[0] || 'Geçersiz XML',
                });
            }
        } catch (e) {
            diagnostics.push({
                from: 0,
                to: Math.min(content.length, 100),
                severity: 'error',
                message: e instanceof Error ? e.message : 'Geçersiz XML',
            });
        }

        return diagnostics;
    });
}

const CodeView: React.FC<CodeViewProps> = ({ file, onContentChange, onJsonParse, onClose, compareContent }) => {
    const [error, setError] = useState<string | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorViewRef = useRef<EditorView | null>(null);
    const mergeViewRef = useRef<MergeView | null>(null);
    const currentFileIdRef = useRef<string | null>(null);
    const [isDark, setIsDark] = useState(false);

    const fileType = getFileType(file);

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

        const currentFileType = getFileType(file);
        const defaultContent = currentFileType === 'xml'
            ? '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n</root>'
            : '{}';

        // If same file, update content if needed
        if (editorViewRef.current && currentFileIdRef.current === file.id) {
            const currentContent = editorViewRef.current.state.doc.toString();
            if (currentContent !== (file.content || defaultContent)) {
                editorViewRef.current.dispatch({
                    changes: {
                        from: 0,
                        to: currentContent.length,
                        insert: file.content || defaultContent,
                    },
                });
            }
            return;
        }

        // Destroy old editor
        if (mergeViewRef.current) {
            mergeViewRef.current.destroy();
            mergeViewRef.current = null;
            editorViewRef.current = null;
        } else if (editorViewRef.current) {
            editorViewRef.current.destroy();
            editorViewRef.current = null;
        }

        currentFileIdRef.current = file.id;
        const content = file.content || defaultContent;

        // Parse initial content
        try {
            if (currentFileType === 'xml') {
                const parsed = parseXml(content);
                onJsonParse(parsed);
                setError(null);
            } else {
                const parsed = JSON.parse(content);
                onJsonParse(parsed);
                setError(null);
            }
        } catch {
            onJsonParse(null);
        }

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                const value = update.state.doc.toString();
                onContentChange(value);

                try {
                    if (currentFileType === 'xml') {
                        const parsed = parseXml(value);
                        onJsonParse(parsed);
                        setError(null);
                    } else {
                        const parsed = JSON.parse(value);
                        onJsonParse(parsed);
                        setError(null);
                    }
                } catch {
                    // Don't set error while typing - linter handles it
                }
            }
        });

        // Language-specific extensions
        const langExtensions = currentFileType === 'xml'
            ? [xml(), xmlLinter()]
            : [json(), linter(jsonParseLinter())];

        const placeholderText = currentFileType === 'xml'
            ? 'XML verisi buraya yazın...\n\n<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item>Test</item>\n</root>'
            : 'JSON verisi buraya yazın...\n\n{\n  "name": "Test",\n  "version": "1.0"\n}';

        const extensions = [
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
            ...langExtensions,
            lintGutter(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            darkThemeCompartment.of(isDark ? oneDark : lightTheme),
            cmPlaceholder(placeholderText),
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
        ];

        let view: EditorView;

        if (compareContent !== undefined) {
             const mergeView = new MergeView({
                a: {
                    doc: compareContent,
                    extensions: [
                        ...extensions,
                        EditorView.editable.of(false),
                    ],
                },
                b: {
                    doc: content,
                    extensions,
                },
                parent: editorContainerRef.current,
             });
             editorViewRef.current = mergeView.b;
             mergeViewRef.current = mergeView;
        } else {
            const state = EditorState.create({
                doc: content,
                extensions,
            });

            view = new EditorView({
                state,
                parent: editorContainerRef.current,
            });

            editorViewRef.current = view;
        }

        return () => {
            // Cleanup on unmount only
        };
    }, [file?.id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mergeViewRef.current) {
                mergeViewRef.current.destroy();
                mergeViewRef.current = null;
            } else if (editorViewRef.current) {
                editorViewRef.current.destroy();
            }
            editorViewRef.current = null;
        };
    }, []);

    const handleFormat = useCallback(() => {
        if (!editorViewRef.current) return;
        const value = editorViewRef.current.state.doc.toString();

        if (!value.trim()) {
            setError(fileType === 'xml' ? 'Lütfen XML verisi girin' : 'Lütfen JSON verisi girin');
            onJsonParse(null);
            return;
        }

        try {
            if (fileType === 'xml') {
                const formatted = formatXml(value);
                editorViewRef.current.dispatch({
                    changes: { from: 0, to: value.length, insert: formatted },
                });
                setError(null);
                const parsed = parseXml(formatted);
                onJsonParse(parsed);
                onContentChange(formatted);
            } else {
                const parsed = JSON.parse(value);
                const formatted = JSON.stringify(parsed, null, 2);
                editorViewRef.current.dispatch({
                    changes: { from: 0, to: value.length, insert: formatted },
                });
                setError(null);
                onJsonParse(parsed);
                onContentChange(formatted);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            setError(`Geçersiz ${fileType === 'xml' ? 'XML' : 'JSON'}: ${errorMessage}`);
            onJsonParse(null);
        }
    }, [onJsonParse, onContentChange, fileType]);

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
                if (fileType === 'xml') {
                    const parsed = parseXml(text);
                    onJsonParse(parsed);
                } else {
                    const parsed = JSON.parse(text);
                    onJsonParse(parsed);
                }
            } catch {
                // pasted content may not be valid yet
            }
        } catch (e) {
            console.error('Clipboard access denied:', e);
            setError('Pano erişimi reddedildi. Lütfen manuel olarak yapıştırın.');
        }
    }, [onContentChange, onJsonParse, fileType]);

    const handleMinify = useCallback(() => {
        if (!editorViewRef.current) return;
        const value = editorViewRef.current.state.doc.toString();

        if (!value.trim()) {
            setError(fileType === 'xml' ? 'Lütfen XML verisi girin' : 'Lütfen JSON verisi girin');
            return;
        }

        try {
            if (fileType === 'xml') {
                const minified = minifyXml(value);
                editorViewRef.current.dispatch({
                    changes: { from: 0, to: value.length, insert: minified },
                });
                setError(null);
                onContentChange(minified);
            } else {
                const parsed = JSON.parse(value);
                const minified = JSON.stringify(parsed);
                editorViewRef.current.dispatch({
                    changes: { from: 0, to: value.length, insert: minified },
                });
                setError(null);
                onContentChange(minified);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            setError(`Geçersiz ${fileType === 'xml' ? 'XML' : 'JSON'}: ${errorMessage}`);
        }
    }, [onContentChange, fileType]);

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

    const fileIcon = fileType === 'xml' ? '📄' : '📄';
    const fileTypeBadge = fileType === 'xml'
        ? <span className="file-type-badge xml">XML</span>
        : <span className="file-type-badge json">JSON</span>;

    return (
        <div className="code-view code-view-editable">
            {/* Toolbar */}
            <div className="code-editor-toolbar">
                <div className="file-name-display">
                    <span className="file-icon">{fileIcon}</span>
                    <span className="file-name">{file.name}</span>
                    {fileTypeBadge}
                    {onClose && (
                        <button className="split-pane-close-btn" onClick={onClose} title="Paneli Kapat">
                            ✕
                        </button>
                    )}
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
