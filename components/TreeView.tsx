'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import TreeNode from './TreeNode';

interface TreeViewProps {
    data: unknown;
    onDataChange?: (newData: unknown) => void;
}

interface SearchResult {
    path: string;
    key: string;
    type: 'key' | 'value';
    displayPath: string;
}

const TreeView: React.FC<TreeViewProps> = ({ data, onDataChange }) => {
    const [expandTrigger, setExpandTrigger] = useState(0);
    const [collapseTrigger, setCollapseTrigger] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [highlightedPath, setHighlightedPath] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchResultsRef = useRef<HTMLDivElement>(null);
    const treeContainerRef = useRef<HTMLDivElement>(null);

    const handleExpandAll = useCallback(() => {
        setExpandTrigger(prev => prev + 1);
    }, []);

    const handleCollapseAll = useCallback(() => {
        setCollapseTrigger(prev => prev + 1);
    }, []);

    // Collect all searchable keys from JSON data
    const allKeys = useMemo(() => {
        const keys: SearchResult[] = [];
        
        const traverse = (obj: unknown, path: string[] = []) => {
            if (obj === null || obj === undefined) return;
            
            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    const newPath = [...path, String(index)];
                    keys.push({
                        path: newPath.join('.'),
                        key: String(index),
                        type: 'key',
                        displayPath: newPath.join(' → '),
                    });
                    traverse(item, newPath);
                });
            } else if (typeof obj === 'object') {
                Object.entries(obj).forEach(([key, value]) => {
                    const newPath = [...path, key];
                    keys.push({
                        path: newPath.join('.'),
                        key,
                        type: 'key',
                        displayPath: newPath.join(' → '),
                    });
                    traverse(value, newPath);
                });
            }
        };
        
        traverse(data);
        return keys;
    }, [data]);

    // Handle search
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim()) {
            const lowerQuery = query.toLowerCase();
            const filtered = allKeys.filter(item => 
                item.key.toLowerCase().includes(lowerQuery)
            ).slice(0, 20); // Limit results
            setSearchResults(filtered);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    }, [allKeys]);

    // Handle search result click
    const handleSearchResultClick = useCallback((result: SearchResult) => {
        // Expand all nodes
        setExpandTrigger(prev => prev + 1);
        
        // Set highlighted path
        setHighlightedPath(result.path);
        
        // Clear search
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
        
        // Scroll to element after expansion
        setTimeout(() => {
            const element = treeContainerRef.current?.querySelector(
                `[data-path="${result.path}"]`
            );
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Remove highlight after animation
            setTimeout(() => {
                setHighlightedPath(null);
            }, 3000);
        }, 100);
    }, []);

    // Handle keyboard events
    const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            setSearchResults([]);
            setShowSearchResults(false);
            searchInputRef.current?.blur();
        }
    }, []);

    // Close search results on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchResultsRef.current &&
                !searchResultsRef.current.contains(e.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(e.target as Node)
            ) {
                setShowSearchResults(false);
            }
        };

        if (showSearchResults) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showSearchResults]);

    const handleValueChange = useCallback((path: (string | number)[], newValue: unknown) => {
        if (!onDataChange || !data) return;

        // Deep clone and update the value at path
        const newData = JSON.parse(JSON.stringify(data));

        // Navigate to the parent and update the value
        let current: Record<string, unknown> | unknown[] = newData;
        for (let i = 0; i < path.length - 1; i++) {
            current = (current as Record<string, unknown>)[path[i] as string] as Record<string, unknown> | unknown[];
        }

        const lastKey = path[path.length - 1];
        if (Array.isArray(current)) {
            current[lastKey as number] = newValue;
        } else {
            (current as Record<string, unknown>)[lastKey as string] = newValue;
        }

        onDataChange(newData);
    }, [data, onDataChange]);

    if (data === null || data === undefined) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h5>JSON Görüntüleyici</h5>
                <p className="text-muted">
                    Sol panele JSON yapıştırın ve &quot;Format & Görüntüle&quot; butonuna tıklayın
                </p>
            </div>
        );
    }

    const isObject = typeof data === 'object' && !Array.isArray(data);
    const isArray = Array.isArray(data);

    const entries = isArray
        ? (data as unknown[]).map((v, i) => [i, v] as [number, unknown])
        : Object.entries(data as object);

    return (
        <div className="tree-view">
            <div className="tree-view-toolbar">
                {/* Search */}
                <div className="tree-search-container">
                    <div className="tree-search-wrapper">
                        <span className="tree-search-icon">🔍</span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="tree-search-input"
                            placeholder="Alan ara..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={() => searchQuery && setShowSearchResults(true)}
                        />
                        {searchQuery && (
                            <button
                                className="tree-search-clear"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSearchResults([]);
                                    setShowSearchResults(false);
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div ref={searchResultsRef} className="tree-search-results">
                            {searchResults.map((result, idx) => (
                                <button
                                    key={`${result.path}-${idx}`}
                                    className="tree-search-result-item"
                                    onClick={() => handleSearchResultClick(result)}
                                >
                                    <span className="result-key">{result.key}</span>
                                    <span className="result-path">{result.displayPath}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {showSearchResults && searchQuery && searchResults.length === 0 && (
                        <div ref={searchResultsRef} className="tree-search-results">
                            <div className="tree-search-no-results">
                                Sonuç bulunamadı
                            </div>
                        </div>
                    )}
                </div>

                {/* Expand/Collapse Buttons */}
                <div className="tree-controls">
                    <button
                        className="btn btn-outline-primary btn-sm control-btn"
                        onClick={handleExpandAll}
                    >
                        ➕ Tümünü Aç
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm control-btn"
                        onClick={handleCollapseAll}
                    >
                        ➖ Tümünü Kapat
                    </button>
                </div>
            </div>

            <div className="tree-root" ref={treeContainerRef}>
                <div className="tree-node">
                    <div className="tree-node-content">
                        <span className="type-icon type-object">{isArray ? '[]' : '{}'}</span>
                        <span className="json-key">JSON</span>
                    </div>
                    <div className="tree-children">
                        {entries.map(([key, val], index) => (
                            <TreeNode
                                key={`root-${key}`}
                                nodeKey={key}
                                value={val}
                                isLast={index === entries.length - 1}
                                expandAll={expandTrigger > 0}
                                collapseAll={collapseTrigger > 0}
                                path={[]}
                                onValueChange={handleValueChange}
                                highlightedPath={highlightedPath}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreeView;
