'use client';

import React, { useState, useCallback } from 'react';
import TreeNode from './TreeNode';

interface TreeViewProps {
    data: unknown;
    onDataChange?: (newData: unknown) => void;
}

const TreeView: React.FC<TreeViewProps> = ({ data, onDataChange }) => {
    const [expandTrigger, setExpandTrigger] = useState(0);
    const [collapseTrigger, setCollapseTrigger] = useState(0);

    const handleExpandAll = useCallback(() => {
        setExpandTrigger(prev => prev + 1);
    }, []);

    const handleCollapseAll = useCallback(() => {
        setCollapseTrigger(prev => prev + 1);
    }, []);

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
            <div className="d-flex gap-2 mb-3">
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

            <div className="tree-root">
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
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreeView;
