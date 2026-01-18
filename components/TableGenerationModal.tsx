'use client';

import React, { useState, useEffect } from 'react';

interface TableGenerationModalProps {
    isOpen: boolean;
    nodeName: string | number;
    data: unknown;
    onClose: () => void;
}

interface TableRow {
    name: string;
    type: string;
    description: string;
}

const TableGenerationModal: React.FC<TableGenerationModalProps> = ({ isOpen, nodeName, data, onClose }) => {
    const [markdown, setMarkdown] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && data !== undefined) {
            const rows: TableRow[] = [];
            generateRows(data, '', rows);
            const md = generateMarkdown(rows);
            setMarkdown(md);
        }
    }, [isOpen, data]);

    const generateRows = (obj: unknown, prefix: string, rows: TableRow[]) => {
        if (obj === null) {
            // Primitive null check is handled in parent mostly, but just in case
            return;
        }

        if (Array.isArray(obj)) {
            // If it's an array, look at the first item to define structure if possible
            if (obj.length > 0) {
                const firstItem = obj[0];
                const type = typeof firstItem === 'object' && firstItem !== null
                    ? (Array.isArray(firstItem) ? 'array' : 'object')
                    : typeof firstItem;

                // Add the array itself? Usually we want fields inside.
                // Let's add the array definition
                // rows.push({ name: prefix || 'ROOT', type: 'array', description: '' });

                // Process first item as representative suitable for table docs
                generateRows(firstItem, prefix ? `${prefix}[]` : '[]', rows);
            }
            return;
        }

        if (typeof obj === 'object') {
            Object.entries(obj).forEach(([key, value]) => {
                const currentName = prefix ? `${prefix}.${key}` : key;
                let type = typeof value;

                if (value === null) type = 'null';
                else if (Array.isArray(value)) type = 'array';

                rows.push({
                    name: currentName,
                    type: type,
                    description: ''
                });

                // Recurse if object
                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    generateRows(value, currentName, rows);
                }
                // Recurse if array (processing first item)
                if (Array.isArray(value) && value.length > 0) {
                    generateRows(value, currentName, rows);
                }
            });
        } else {
            // Primitive value at root (unlikely for "table" but possible)
            rows.push({
                name: prefix || 'Value',
                type: typeof obj,
                description: ''
            });
        }
    };

    const generateMarkdown = (rows: TableRow[]) => {
        // Confluence Markdown Table Format
        // || Header 1 || Header 2 || Header 3 ||
        // | Cell 1 | Cell 2 | Cell 3 |

        let md = '|| Ad || Type || Açıklama ||\n';
        rows.forEach(row => {
            md += `| ${row.name} | ${row.type} | ${row.description} |\n`;
        });
        return md;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(markdown);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="edit-modal" style={{ maxWidth: '800px', width: '90%' }}>
                <div className="edit-modal-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Tablo Oluştur: {nodeName}</h5>
                    <div className="window-controls">
                        <button className="window-close" onClick={onClose}>×</button>
                    </div>
                </div>

                <div className="edit-modal-body">
                    <div className="mb-3">
                        <textarea
                            className="form-control code-editor-textarea"
                            style={{ height: '300px', fontFamily: 'monospace', whiteSpace: 'pre' }}
                            value={markdown}
                            readOnly
                        />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Kapat
                        </button>
                        <button className="btn btn-primary" onClick={handleCopy}>
                            {copied ? '✅ Kopyalandı' : '📋 Markdown Kopyala'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableGenerationModal;
