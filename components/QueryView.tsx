'use client';

import React, { useState, useCallback, useMemo } from 'react';

interface QueryViewProps {
    data: unknown;
}

interface SearchResult {
    path: string;
    key: string;
    value: unknown;
    type: string;
}

const QueryView: React.FC<QueryViewProps> = ({ data }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'key' | 'value' | 'all'>('all');

    const searchResults = useMemo(() => {
        if (!data || !searchQuery.trim()) return [];

        const results: SearchResult[] = [];
        const query = searchQuery.toLowerCase();

        const searchNode = (value: unknown, path: string = '') => {
            if (value === null) {
                if (searchType !== 'key' && 'null'.includes(query)) {
                    results.push({ path, key: path.split('.').pop() || '', value: null, type: 'null' });
                }
                return;
            }

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    searchNode(item, `${path}[${index}]`);
                });
                return;
            }

            if (typeof value === 'object') {
                Object.entries(value).forEach(([key, val]) => {
                    const newPath = path ? `${path}.${key}` : key;

                    // Check key match
                    if (searchType !== 'value' && key.toLowerCase().includes(query)) {
                        results.push({ path: newPath, key, value: val, type: typeof val });
                    }
                    // Check value match for primitives
                    else if (searchType !== 'key' && typeof val !== 'object' && val !== null) {
                        if (String(val).toLowerCase().includes(query)) {
                            results.push({ path: newPath, key, value: val, type: typeof val });
                        }
                    }

                    // Recurse
                    searchNode(val, newPath);
                });
                return;
            }

            // Primitive at root level (shouldn't happen often)
            if (searchType !== 'key' && String(value).toLowerCase().includes(query)) {
                results.push({ path, key: path, value, type: typeof value });
            }
        };

        searchNode(data);

        // Remove duplicates
        const seen = new Set<string>();
        return results.filter(r => {
            if (seen.has(r.path)) return false;
            seen.add(r.path);
            return true;
        });
    }, [data, searchQuery, searchType]);

    const renderValue = (value: unknown): string => {
        if (value === null) return 'null';
        if (typeof value === 'object') return Array.isArray(value) ? `[${value.length} items]` : '{...}';
        return String(value);
    };

    const getTypeClass = (type: string): string => {
        switch (type) {
            case 'string': return 'type-string';
            case 'number': return 'type-number';
            case 'boolean': return 'type-boolean';
            case 'null': return 'type-null';
            case 'object': return 'type-object';
            default: return '';
        }
    };

    if (!data) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h5>Query Arama</h5>
                <p className="text-muted">JSON verisi yüklendiğinde arama yapabilirsiniz</p>
            </div>
        );
    }

    return (
        <div className="query-view">
            {/* Search Bar */}
            <div className="query-search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="JSON içinde ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')}>
                            ×
                        </button>
                    )}
                </div>
                <div className="search-filters">
                    <button
                        className={`filter-btn ${searchType === 'all' ? 'active' : ''}`}
                        onClick={() => setSearchType('all')}
                    >
                        Tümü
                    </button>
                    <button
                        className={`filter-btn ${searchType === 'key' ? 'active' : ''}`}
                        onClick={() => setSearchType('key')}
                    >
                        Key
                    </button>
                    <button
                        className={`filter-btn ${searchType === 'value' ? 'active' : ''}`}
                        onClick={() => setSearchType('value')}
                    >
                        Value
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="query-results">
                {searchQuery.trim() === '' ? (
                    <div className="query-hint">
                        <p>💡 Arama yapmak için yukarıdaki kutucuğa yazın</p>
                        <p className="text-muted">Key veya value bazında filtreleme yapabilirsiniz</p>
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="query-no-results">
                        <span className="no-results-icon">😕</span>
                        <p>"{searchQuery}" için sonuç bulunamadı</p>
                    </div>
                ) : (
                    <>
                        <div className="results-count">
                            {searchResults.length} sonuç bulundu
                        </div>
                        <div className="results-list">
                            {searchResults.map((result, index) => (
                                <div key={index} className="result-item">
                                    <div className="result-path">{result.path}</div>
                                    <div className="result-content">
                                        <span className="result-key">{result.key}</span>
                                        <span className="result-separator">:</span>
                                        <span className={`result-value ${getTypeClass(result.type)}`}>
                                            {renderValue(result.value)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default QueryView;
