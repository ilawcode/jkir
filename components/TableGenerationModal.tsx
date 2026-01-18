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
    const [rows, setRows] = useState<TableRow[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && data !== undefined) {
            const generatedRows: TableRow[] = [];
            generateRows(data, '', generatedRows);
            const md = generateMarkdown(generatedRows);

            setRows(generatedRows);
            setMarkdown(md);
        }
    }, [isOpen, data]);

    const generateRows = (obj: unknown, prefix: string, rows: TableRow[]) => {
        if (obj === null) {
            return;
        }

        if (Array.isArray(obj)) {
            if (obj.length > 0) {
                const firstItem = obj[0];
                generateRows(firstItem, prefix ? `${prefix}[]` : '[]', rows);
            }
            return;
        }

        if (typeof obj === 'object') {
            Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
                const currentName = prefix ? `${prefix}.${key}` : key;
                let type: string = typeof value;

                if (value === null) type = 'null';
                else if (Array.isArray(value)) type = 'array';

                rows.push({
                    name: currentName,
                    type: type,
                    description: ''
                });

                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    generateRows(value, currentName, rows);
                }
                if (Array.isArray(value) && value.length > 0) {
                    generateRows(value, currentName, rows);
                }
            });
        } else {
            rows.push({
                name: prefix || 'Value',
                type: typeof obj,
                description: ''
            });
        }
    };

    const generateMarkdown = (rows: TableRow[]) => {
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
                <div className="edit-modal-header">
                    <h5 className="mb-0">Tablo Oluştur: {nodeName}</h5>
                    <button className="window-close" onClick={onClose}>×</button>
                </div>

                <div className="edit-modal-body">
                    <div className="mb-3 table-responsive border rounded bg-white">
                        <table className="table table-striped table-hover mb-0" style={{ fontSize: '13px' }}>
                            <thead className="table-light">
                                <tr>
                                    <th>Ad</th>
                                    <th>Type</th>
                                    <th>Açıklama</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index}>
                                        <td className="font-monospace text-primary">{row.name}</td>
                                        <td>
                                            <span className={`badge bg-opacity-10 text-dark border ${row.type === 'string' ? 'bg-success text-success border-success' :
                                                    row.type === 'number' ? 'bg-primary text-primary border-primary' :
                                                        row.type === 'boolean' ? 'bg-warning text-warning border-warning' :
                                                            row.type === 'object' ? 'bg-info text-info border-info' :
                                                                'bg-secondary text-secondary border-secondary'
                                                }`}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td className="text-muted fst-italic">{row.description || '-'}</td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-muted">
                                            Gösterilecek veri bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
