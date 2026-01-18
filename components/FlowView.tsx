'use client';

import React, { useMemo } from 'react';

interface FlowViewProps {
    data: unknown;
}

interface NodeInfo {
    name: string;
    type: 'object' | 'array' | 'primitive';
    children: NodeInfo[];
    properties: { key: string; type: string; value?: string }[];
}

const FlowView: React.FC<FlowViewProps> = ({ data }) => {
    const structure = useMemo(() => {
        if (!data) return null;

        const analyzeNode = (value: unknown, name: string): NodeInfo => {
            if (value === null) {
                return { name, type: 'primitive', children: [], properties: [{ key: name, type: 'null', value: 'null' }] };
            }

            if (Array.isArray(value)) {
                const children: NodeInfo[] = [];
                if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                    children.push(analyzeNode(value[0], `${name}[0]`));
                }
                return {
                    name,
                    type: 'array',
                    children,
                    properties: [{ key: 'length', type: 'number', value: String(value.length) }],
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
                        children.push(analyzeNode(val, key));
                    } else if (typeof val === 'object') {
                        children.push(analyzeNode(val, key));
                    } else {
                        const valType = typeof val;
                        properties.push({
                            key,
                            type: valType,
                            value: String(val).substring(0, 30) + (String(val).length > 30 ? '...' : '')
                        });
                    }
                });

                return { name, type: 'object', children, properties };
            }

            return {
                name,
                type: 'primitive',
                children: [],
                properties: [{ key: name, type: typeof value, value: String(value) }]
            };
        };

        return analyzeNode(data, 'Root');
    }, [data]);

    const renderNode = (node: NodeInfo, level: number = 0): React.ReactNode => {
        const isRoot = level === 0;

        return (
            <div key={`${node.name}-${level}`} className={`flow-node-container level-${level}`}>
                <div className={`flow-node ${node.type} ${isRoot ? 'root' : ''}`}>
                    <div className="flow-node-header">
                        <span className="flow-node-icon">
                            {node.type === 'object' ? '{}' : node.type === 'array' ? '[]' : '◆'}
                        </span>
                        <span className="flow-node-name">{node.name}</span>
                        <span className="flow-node-type">{node.type}</span>
                    </div>
                    {node.properties.length > 0 && (
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

                {node.children.length > 0 && (
                    <div className="flow-children">
                        <div className="flow-connector"></div>
                        <div className="flow-children-nodes">
                            {node.children.map((child, idx) => renderNode(child, level + 1))}
                        </div>
                    </div>
                )}
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
            <div className="flow-legend">
                <span className="legend-item"><span className="legend-box object"></span> Object</span>
                <span className="legend-item"><span className="legend-box array"></span> Array</span>
                <span className="legend-item"><span className="legend-box primitive"></span> Primitive</span>
            </div>
            <div className="flow-diagram">
                {structure && renderNode(structure)}
            </div>
        </div>
    );
};

export default FlowView;
