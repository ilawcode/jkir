'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ContextMenu from './ContextMenu';
import EditModal from './EditModal';
import TableGenerationModal from './TableGenerationModal';

interface TreeNodeProps {
  nodeKey: string | number;
  value: unknown;
  isLast: boolean;
  expandTrigger: number;
  collapseTrigger: number;
  depth?: number;
  path?: (string | number)[];
  onValueChange?: (path: (string | number)[], newValue: unknown) => void;
  highlightedPath?: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  nodeKey,
  value,
  isLast,
  expandTrigger,
  collapseTrigger,
  depth = 0,
  path = [],
  onValueChange,
  highlightedPath,
}) => {
  // Start expanded if expandTrigger is already > 0 (for newly mounted nodes during cascade)
  const [isExpanded, setIsExpanded] = useState(() => expandTrigger > 0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [lastExpandTrigger, setLastExpandTrigger] = useState(expandTrigger);
  const [lastCollapseTrigger, setLastCollapseTrigger] = useState(collapseTrigger);

  const currentPath = [...path, nodeKey];
  const pathString = currentPath.join('.');
  const isHighlighted = highlightedPath === pathString;

  // Respond to expand trigger changes
  useEffect(() => {
    if (expandTrigger > lastExpandTrigger) {
      setIsExpanded(true);
      setLastExpandTrigger(expandTrigger);
    }
  }, [expandTrigger, lastExpandTrigger]);

  // Respond to collapse trigger changes
  useEffect(() => {
    if (collapseTrigger > lastCollapseTrigger) {
      setIsExpanded(false);
      setLastCollapseTrigger(collapseTrigger);
    }
  }, [collapseTrigger, lastCollapseTrigger]);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const hasChildren = isObject || isArray;

  const renderValue = (val: unknown): React.ReactNode => {
    if (val === null) return <span className="json-null">null</span>;
    if (typeof val === 'string') return <span className="json-string">{val}</span>;
    if (typeof val === 'number') return <span className="json-number">{String(val)}</span>;
    if (typeof val === 'boolean') return <span className="json-boolean">{String(val)}</span>;
    return null;
  };

  const toggleExpand = useCallback(() => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  }, [hasChildren, isExpanded]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleEdit = useCallback(() => {
    setContextMenu(null);
    setIsEditing(true);
  }, []);

  const handleSave = useCallback((newValue: unknown) => {
    if (onValueChange) {
      onValueChange(currentPath, newValue);
    }
    setIsEditing(false);
  }, [currentPath, onValueChange]);

  const handleCloseEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const renderChildren = () => {
    if (!hasChildren || !isExpanded) return null;

    const entries = isArray
      ? (value as unknown[]).map((v, i) => [i, v] as [number, unknown])
      : Object.entries(value as object);

    return (
      <div className="tree-children">
        {entries.map(([key, val], index) => (
          <TreeNode
            key={`${depth}-${key}`}
            nodeKey={key}
            value={val}
            isLast={index === entries.length - 1}
            expandTrigger={expandTrigger}
            collapseTrigger={collapseTrigger}
            depth={depth + 1}
            path={currentPath}
            onValueChange={onValueChange}
            highlightedPath={highlightedPath}
          />
        ))}
      </div>
    );
  };

  const getIcon = () => {
    if (isObject) return <span className="type-icon type-object">{isExpanded ? '▾' : '▸'} {'{}'}</span>;
    if (isArray) return <span className="type-icon type-array">{isExpanded ? '▾' : '▸'} {'[]'}</span>;
    return <span className="type-icon type-value">■</span>;
  };

  return (
    <div className={`tree-node ${isHighlighted ? 'highlighted' : ''}`} data-path={pathString}>
      <div
        className="tree-node-content"
        onClick={toggleExpand}
        onContextMenu={handleContextMenu}
      >
        {getIcon()}
        <span className="json-key">{nodeKey}</span>
        {!hasChildren && (
          <>
            <span className="json-colon"> : </span>
            {renderValue(value)}
          </>
        )}
      </div>

      {renderChildren()}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={handleEdit}
          onCreateTable={() => {
            setContextMenu(null);
            setIsTableModalOpen(true);
          }}
          onClose={handleCloseContextMenu}
        />
      )}

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditing}
        nodeKey={nodeKey}
        value={value}
        onSave={handleSave}
        onClose={handleCloseEdit}
      />

      {/* Table Generation Modal */}
      <TableGenerationModal
        isOpen={isTableModalOpen}
        nodeName={nodeKey}
        data={value}
        onClose={() => setIsTableModalOpen(false)}
      />
    </div>
  );
};

export default TreeNode;
