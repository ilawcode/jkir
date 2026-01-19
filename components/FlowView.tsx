'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

interface FlowViewProps {
    data: unknown;
}

interface NodeInfo {
    id: string;
    name: string;
    type: 'object' | 'array' | 'primitive';
    children: NodeInfo[];
    properties: { key: string; type: string; value?: string }[];
    rawData: unknown;
    path: string;
}

interface TableModalState {
    visible: boolean;
    title: string;
    data: unknown;
    path: string;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

const FlowView: React.FC<FlowViewProps> = ({ data }) => {
    const [tableModal, setTableModal] = useState<TableModalState>({
        visible: false,
        title: '',
        data: null,
        path: '',
    });
    const [copied, setCopied] = useState(false);
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const diagramRef = useRef<HTMLDivElement>(null);
    const diagramContainerRef = useRef<HTMLDivElement>(null);

    // Collect all node IDs
    const collectNodeIds = useCallback((node: NodeInfo): string[] => {
        const ids = [node.id];
        node.children.forEach(child => {
            ids.push(...collectNodeIds(child));
        });
        return ids;
    }, []);

    const structure = useMemo(() => {
        if (!data) return null;

        let idCounter = 0;
        const analyzeNode = (value: unknown, name: string, path: string = ''): NodeInfo => {
            const currentPath = path ? `${path}.${name}` : name;
            const nodeId = `node-${idCounter++}`;

            if (value === null) {
                return { 
                    id: nodeId,
                    name, 
                    type: 'primitive', 
                    children: [], 
                    properties: [{ key: name, type: 'null', value: 'null' }],
                    rawData: value,
                    path: currentPath,
                };
            }

            if (Array.isArray(value)) {
                const children: NodeInfo[] = [];
                if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                    children.push(analyzeNode(value[0], `${name}[0]`, currentPath));
                }
                return {
                    id: nodeId,
                    name,
                    type: 'array',
                    children,
                    properties: [{ key: 'length', type: 'number', value: String(value.length) }],
                    rawData: value,
                    path: currentPath,
                };
            }

            if (typeof value === 'object') {
                const entries = Object.entries(value);
                const properties: { key: string; type: string; value?: string }[] = [];
                const children: NodeInfo[] = [];

                entries.forEach(([key, val]) => {
                    if (val === null) {
                        properties.push({ key, type: 'null' });
                    } else if (Array.isArray(val)) {
                        children.push(analyzeNode(val, key, currentPath));
                    } else if (typeof val === 'object') {
                        children.push(analyzeNode(val, key, currentPath));
                    } else {
                        const valType = typeof val;
                        properties.push({
                            key,
                            type: valType,
                            value: String(val).substring(0, 30) + (String(val).length > 30 ? '...' : '')
                        });
                    }
                });

                return { 
                    id: nodeId,
                    name, 
                    type: 'object', 
                    children, 
                    properties,
                    rawData: value,
                    path: currentPath,
                };
            }

            return {
                id: nodeId,
                name,
                type: 'primitive',
                children: [],
                properties: [{ key: name, type: typeof value, value: String(value) }],
                rawData: value,
                path: currentPath,
            };
        };

        return analyzeNode(data, 'Root');
    }, [data]);

    // Get all nodes as flat list for search
    const allNodes = useMemo(() => {
        if (!structure) return [];
        
        const nodes: NodeInfo[] = [];
        const traverse = (node: NodeInfo) => {
            nodes.push(node);
            node.children.forEach(traverse);
        };
        traverse(structure);
        return nodes;
    }, [structure]);

    // Filter nodes based on search
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return allNodes.filter(node => 
            node.name.toLowerCase().includes(query) ||
            node.path.toLowerCase().includes(query)
        );
    }, [searchQuery, allNodes]);

    // Expand all nodes
    const expandAll = useCallback(() => {
        setCollapsedNodes(new Set());
    }, []);

    // Collapse all nodes
    const collapseAll = useCallback(() => {
        if (!structure) return;
        const allIds = collectNodeIds(structure);
        setCollapsedNodes(new Set(allIds));
    }, [structure, collectNodeIds]);

    // Toggle single node
    const toggleNode = useCallback((nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    // Zoom functions
    const zoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
    }, []);

    const zoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
    }, []);

    const resetZoom = useCallback(() => {
        setZoom(1);
    }, []);

    // Handle mouse wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    }, [zoomIn, zoomOut]);

    // Export to PNG
    const exportToPng = useCallback(async () => {
        if (!diagramRef.current || isExporting) return;

        setIsExporting(true);
        try {
            // Temporarily reset zoom for export
            const originalZoom = zoom;
            setZoom(1);
            
            // Wait for the zoom to apply
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(diagramRef.current, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher resolution
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            // Restore zoom
            setZoom(originalZoom);

            // Create download link
            const link = document.createElement('a');
            link.download = `flow-diagram-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setIsExporting(false);
        }
    }, [zoom, isExporting]);

    // Navigate to search result
    const navigateToNode = useCallback((node: NodeInfo) => {
        // Expand all parent nodes
        if (structure) {
            const findParentIds = (current: NodeInfo, targetId: string, parents: string[] = []): string[] | null => {
                if (current.id === targetId) return parents;
                for (const child of current.children) {
                    const result = findParentIds(child, targetId, [...parents, current.id]);
                    if (result) return result;
                }
                return null;
            };

            const parentIds = findParentIds(structure, node.id) || [];
            setCollapsedNodes(prev => {
                const newSet = new Set(prev);
                parentIds.forEach(id => newSet.delete(id));
                newSet.delete(node.id);
                return newSet;
            });
        }

        // Highlight and scroll to node
        setHighlightedNodeId(node.id);
        setSearchQuery('');
        
        setTimeout(() => {
            const nodeElement = nodeRefs.current.get(node.id);
            if (nodeElement) {
                nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        // Remove highlight after 2 seconds
        setTimeout(() => {
            setHighlightedNodeId(null);
        }, 2500);
    }, [structure]);

    const handleNodeClick = useCallback((node: NodeInfo) => {
        setTableModal({
            visible: true,
            title: node.name,
            data: node.rawData,
            path: node.path,
        });
        setCopied(false);
    }, []);

    const closeTableModal = useCallback(() => {
        setTableModal({ visible: false, title: '', data: null, path: '' });
        setCopied(false);
    }, []);

    // Get type string for a value
    const getTypeString = (val: unknown): string => {
        if (val === null) return 'null';
        if (Array.isArray(val)) return `array[${val.length}]`;
        if (typeof val === 'object') return 'object';
        return typeof val;
    };

    // Flatten object keys recursively for nested objects
    const flattenKeys = (obj: Record<string, unknown>, prefix: string = ''): { key: string; type: string }[] => {
        const result: { key: string; type: string }[] = [];
        
        for (const [key, val] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            const type = getTypeString(val);
            
            if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                result.push(...flattenKeys(val as Record<string, unknown>, fullKey));
            } else {
                result.push({ key: fullKey, type });
            }
        }
        
        return result;
    };

    // Generate table data
    const generateTableData = useCallback((rawData: unknown): { headers: string[]; rows: string[][] } => {
        const headers = ['Parametre Adı', 'Tip', 'Açıklama'];

        if (Array.isArray(rawData)) {
            if (rawData.length === 0) {
                return { headers, rows: [] };
            }

            if (typeof rawData[0] === 'object' && rawData[0] !== null) {
                const flattened = flattenKeys(rawData[0] as Record<string, unknown>);
                const rows = flattened.map(({ key, type }) => [key, type, '']);
                return { headers, rows };
            }

            return {
                headers,
                rows: [['[index]', getTypeString(rawData[0]), '']],
            };
        }

        if (typeof rawData === 'object' && rawData !== null) {
            const flattened = flattenKeys(rawData as Record<string, unknown>);
            const rows = flattened.map(({ key, type }) => [key, type, '']);
            return { headers, rows };
        }

        return {
            headers,
            rows: [['value', getTypeString(rawData), '']],
        };
    }, []);

    // Generate Markdown table
    const generateMarkdownTable = useCallback((rawData: unknown): string => {
        const { headers, rows } = generateTableData(rawData);
        
        if (rows.length === 0) {
            return `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n| (Veri yok) |`;
        }

        const headerRow = `| ${headers.join(' | ')} |`;
        const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
        const dataRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');

        return `${headerRow}\n${separatorRow}\n${dataRows}`;
    }, [generateTableData]);

    const copyAsMarkdown = useCallback(async () => {
        if (!tableModal.data) return;
        
        const markdown = generateMarkdownTable(tableModal.data);
        try {
            await navigator.clipboard.writeText(markdown);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }, [tableModal.data, generateMarkdownTable]);

    const renderNode = (node: NodeInfo, level: number = 0): React.ReactNode => {
        const isRoot = level === 0;
        const isCollapsed = collapsedNodes.has(node.id);
        const hasChildren = node.children.length > 0;
        const isHighlighted = highlightedNodeId === node.id;

        return (
            <div 
                key={node.id} 
                className={`flow-node-container level-${level}`}
                ref={(el) => {
                    if (el) nodeRefs.current.set(node.id, el);
                }}
            >
                <div 
                    className={`flow-node ${node.type} ${isRoot ? 'root' : ''} clickable ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => handleNodeClick(node)}
                    title="Tablo olarak görmek için tıklayın"
                >
                    <div className="flow-node-header">
                        {hasChildren && (
                            <button 
                                className={`flow-collapse-btn ${isCollapsed ? 'collapsed' : ''}`}
                                onClick={(e) => toggleNode(node.id, e)}
                                title={isCollapsed ? 'Genişlet' : 'Daralt'}
                            >
                                {isCollapsed ? '▶' : '▼'}
                            </button>
                        )}
                        <span className="flow-node-icon">
                            {node.type === 'object' ? '{}' : node.type === 'array' ? '[]' : '◆'}
                        </span>
                        <span className="flow-node-name">{node.name}</span>
                        <span className="flow-node-type">{node.type}</span>
                        <span className="flow-node-action" title="Tablo olarak göster">⊞</span>
                    </div>
                    {!isCollapsed && node.properties.length > 0 && (
                        <div className="flow-node-body">
                            {node.properties.map((prop, idx) => (
                                <div key={idx} className="flow-property">
                                    <span className="prop-key">{prop.key}</span>
                                    <span className="prop-type">{prop.type}</span>
                                    {prop.value && <span className="prop-value">{prop.value}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!isCollapsed && hasChildren && (
                    <div className="flow-children">
                        <div className="flow-connector"></div>
                        <div className="flow-children-nodes">
                            {node.children.map((child) => renderNode(child, level + 1))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderTableModal = () => {
        if (!tableModal.visible || !tableModal.data) return null;

        const { headers, rows } = generateTableData(tableModal.data);

        return (
            <div className="modal-overlay" onClick={closeTableModal}>
                <div className="table-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="table-modal-header">
                        <div className="table-modal-title">
                            <svg className="table-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="3" y1="15" x2="21" y2="15"></line>
                                <line x1="9" y1="3" x2="9" y2="21"></line>
                                <line x1="15" y1="3" x2="15" y2="21"></line>
                            </svg>
                            <h3>{tableModal.title}</h3>
                            <span className="table-path">{tableModal.path}</span>
                        </div>
                        <div className="table-modal-actions">
                            <button 
                                className={`btn-copy-markdown ${copied ? 'copied' : ''}`}
                                onClick={copyAsMarkdown}
                                title="Confluence için Markdown olarak kopyala"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                {copied ? 'Kopyalandı!' : 'Markdown Kopyala'}
                            </button>
                            <button className="window-close" onClick={closeTableModal}>×</button>
                        </div>
                    </div>
                    <div className="table-modal-body">
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {headers.map((header, idx) => (
                                            <th key={idx}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={headers.length} className="empty-cell">
                                                Veri yok
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row, rowIdx) => (
                                            <tr key={rowIdx}>
                                                {row.map((cell, cellIdx) => (
                                                    <td key={cellIdx}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="table-modal-footer">
                        <span className="table-info">
                            {rows.length} satır • {headers.length} sütun
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (!data) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">⚡</div>
                <h5>Flow Diyagramı</h5>
                <p className="text-muted">JSON verisi yüklendiğinde yapı diyagramı burada gösterilecek</p>
            </div>
        );
    }

    return (
        <div className="flow-view">
            {/* Toolbar */}
            <div className="flow-toolbar">
                <div className="flow-toolbar-left">
                    <div className="flow-search-wrapper">
                        <svg className="flow-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            className="flow-search-input"
                            placeholder="Obje ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                className="flow-search-clear"
                                onClick={() => setSearchQuery('')}
                            >
                                ×
                            </button>
                        )}
                        {/* Search Results Dropdown */}
                        {searchQuery && searchResults.length > 0 && (
                            <div className="flow-search-results">
                                {searchResults.slice(0, 10).map((node) => (
                                    <button
                                        key={node.id}
                                        className="flow-search-result-item"
                                        onClick={() => navigateToNode(node)}
                                    >
                                        <span className="result-icon">
                                            {node.type === 'object' ? '{}' : node.type === 'array' ? '[]' : '◆'}
                                        </span>
                                        <span className="result-name">{node.name}</span>
                                        <span className="result-path">{node.path}</span>
                                    </button>
                                ))}
                                {searchResults.length > 10 && (
                                    <div className="flow-search-more">
                                        +{searchResults.length - 10} sonuç daha...
                                    </div>
                                )}
                            </div>
                        )}
                        {searchQuery && searchResults.length === 0 && (
                            <div className="flow-search-results">
                                <div className="flow-search-no-results">Sonuç bulunamadı</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flow-toolbar-center">
                    {/* Zoom Controls */}
                    <div className="flow-zoom-controls">
                        <button 
                            className="flow-zoom-btn" 
                            onClick={zoomOut} 
                            disabled={zoom <= ZOOM_MIN}
                            title="Uzaklaştır (Ctrl + Scroll)"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                        </button>
                        <button 
                            className="flow-zoom-level" 
                            onClick={resetZoom}
                            title="Sıfırla"
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <button 
                            className="flow-zoom-btn" 
                            onClick={zoomIn} 
                            disabled={zoom >= ZOOM_MAX}
                            title="Yakınlaştır (Ctrl + Scroll)"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="flow-toolbar-right">
                    <button className="flow-toolbar-btn" onClick={expandAll} title="Tümünü Genişlet">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                        Tümünü Aç
                    </button>
                    <button className="flow-toolbar-btn" onClick={collapseAll} title="Tümünü Daralt">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="4 14 10 14 10 20"></polyline>
                            <polyline points="20 10 14 10 14 4"></polyline>
                            <line x1="14" y1="10" x2="21" y2="3"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                        Tümünü Kapat
                    </button>
                    <button 
                        className={`flow-toolbar-btn export-btn ${isExporting ? 'exporting' : ''}`}
                        onClick={exportToPng} 
                        disabled={isExporting}
                        title="PNG olarak dışa aktar"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        {isExporting ? 'Exporting...' : 'PNG'}
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flow-legend">
                <span className="legend-item"><span className="legend-box object"></span> Object</span>
                <span className="legend-item"><span className="legend-box array"></span> Array</span>
                <span className="legend-item"><span className="legend-box primitive"></span> Primitive</span>
                <span className="legend-item legend-hint">💡 Tablo için kutuya tıklayın • Ctrl+Scroll ile yakınlaştır</span>
            </div>

            {/* Diagram Container with Zoom */}
            <div 
                className="flow-diagram-container" 
                ref={diagramContainerRef}
                onWheel={handleWheel}
            >
                <div 
                    className="flow-diagram"
                    ref={diagramRef}
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                    }}
                >
                    {structure && renderNode(structure)}
                </div>
            </div>

            {renderTableModal()}
        </div>
    );
};

export default FlowView;
