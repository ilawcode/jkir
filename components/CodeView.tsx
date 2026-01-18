'use client';

import React, { useMemo } from 'react';

interface CodeViewProps {
    data: unknown;
}

const CodeView: React.FC<CodeViewProps> = ({ data }) => {
    const { lines, lineCount } = useMemo(() => {
        if (!data) {
            return { lines: [], lineCount: 0 };
        }
        const jsonString = JSON.stringify(data, null, 2);
        const lineArray = jsonString.split('\n');
        return { lines: lineArray, lineCount: lineArray.length };
    }, [data]);

    const syntaxHighlight = (line: string): React.ReactNode => {
        // Match different JSON parts
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let key = 0;

        // Match key-value patterns
        const keyMatch = remaining.match(/^(\s*)("[\w\s-]+")(:\s*)/);
        if (keyMatch) {
            parts.push(<span key={key++} className="code-indent">{keyMatch[1]}</span>);
            parts.push(<span key={key++} className="code-key">{keyMatch[2]}</span>);
            parts.push(<span key={key++} className="code-colon">{keyMatch[3]}</span>);
            remaining = remaining.slice(keyMatch[0].length);
        }

        // Match values
        if (remaining) {
            // String value
            const stringMatch = remaining.match(/^(".*?")(,?)$/);
            if (stringMatch) {
                parts.push(<span key={key++} className="code-string">{stringMatch[1]}</span>);
                if (stringMatch[2]) parts.push(<span key={key++} className="code-comma">{stringMatch[2]}</span>);
            }
            // Number value
            else if (/^-?\d+\.?\d*(,?)$/.test(remaining)) {
                const numMatch = remaining.match(/^(-?\d+\.?\d*)(,?)$/);
                if (numMatch) {
                    parts.push(<span key={key++} className="code-number">{numMatch[1]}</span>);
                    if (numMatch[2]) parts.push(<span key={key++} className="code-comma">{numMatch[2]}</span>);
                }
            }
            // Boolean/null
            else if (/^(true|false|null)(,?)$/.test(remaining)) {
                const boolMatch = remaining.match(/^(true|false|null)(,?)$/);
                if (boolMatch) {
                    parts.push(<span key={key++} className="code-boolean">{boolMatch[1]}</span>);
                    if (boolMatch[2]) parts.push(<span key={key++} className="code-comma">{boolMatch[2]}</span>);
                }
            }
            // Brackets
            else if (/^[\[\]{}],?$/.test(remaining.trim())) {
                parts.push(<span key={key++} className="code-bracket">{remaining}</span>);
            }
            // Other
            else {
                parts.push(<span key={key++}>{remaining}</span>);
            }
        }

        return parts.length > 0 ? parts : line;
    };

    if (!data) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h5>Code Görünümü</h5>
                <p className="text-muted">JSON verisi yüklendiğinde kod görünümü burada gösterilecek</p>
            </div>
        );
    }

    return (
        <div className="code-view">
            <div className="code-editor">
                <div className="code-gutter">
                    {lines.map((_, index) => (
                        <div key={index} className="line-num">{index + 1}</div>
                    ))}
                </div>
                <div className="code-content">
                    {lines.map((line, index) => (
                        <div key={index} className="code-line">
                            {syntaxHighlight(line)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CodeView;
