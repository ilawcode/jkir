'use client';

import React, { useState } from 'react';
import { JkirCollection } from '../hooks/useCollections';

interface CollectionItemProps {
  item: JkirCollection;
  selectedId: string | null;
  level: number;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, item: JkirCollection) => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  item,
  selectedId,
  level,
  onSelect,
  onToggle,
  onContextMenu,
}) => {
  const isSelected = selectedId === item.id;
  const isFolder = item.type === 'folder';
  const hasChildren = isFolder && item.children && item.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggle(item.id);
    }
    onSelect(item.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggle(item.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, item);
  };

  return (
    <div className="collection-item-wrapper">
      <div
        className={`collection-item ${isSelected ? 'selected' : ''} ${isFolder ? 'folder' : 'file'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {isFolder && (
          <span className={`collection-toggle ${item.isExpanded ? 'expanded' : ''}`}>
            {hasChildren ? (item.isExpanded ? '▼' : '▶') : ''}
          </span>
        )}
        <span className="collection-icon">
          {isFolder ? (item.isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="collection-name" title={item.name}>
          {item.name}
        </span>
      </div>

      {isFolder && item.isExpanded && item.children && (
        <div className="collection-children">
          {item.children.map((child) => (
            <CollectionItem
              key={child.id}
              item={child}
              selectedId={selectedId}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionItem;
