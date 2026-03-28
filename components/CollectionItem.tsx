'use client';

import React from 'react';
import { JkirCollection } from '../hooks/useCollections';

interface CollectionItemProps {
  item: JkirCollection;
  selectedId: string | null;
  highlightedId: string | null;
  level: number;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, item: JkirCollection) => void;
}

function FileSemanticBadges({ item }: { item: JkirCollection }) {
  if (item.type !== 'file') return null;
  const role = item.documentRole ?? 'response';
  const variant = item.responseVariant ?? 'success';
  const ext = item.fileType === 'xml' ? 'XML' : 'JSON';

  return (
    <span className="collection-file-badges" onClick={(e) => e.stopPropagation()}>
      <span className={`collection-badge collection-badge-type ${item.fileType === 'xml' ? 'xml' : 'json'}`}>
        {ext}
      </span>
      <span className={`collection-badge collection-badge-role ${role === 'request' ? 'request' : 'response'}`}>
        {role === 'request' ? 'Req' : 'Res'}
      </span>
      {role === 'response' && (
        <span
          className={`collection-badge collection-badge-variant ${variant === 'success' ? 'success' : variant === 'error' ? 'error' : 'business'}`}
          title={variant === 'businessError' ? 'Business Error' : variant === 'error' ? 'Error' : 'Success'}
        >
          {variant === 'success' ? 'OK' : variant === 'error' ? 'Err' : 'Biz'}
        </span>
      )}
    </span>
  );
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  item,
  selectedId,
  highlightedId,
  level,
  onSelect,
  onToggle,
  onContextMenu,
}) => {
  const isSelected = selectedId === item.id;
  const isHighlighted = highlightedId === item.id;
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
        className={`collection-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${isFolder ? 'folder' : 'file'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        data-item-id={item.id}
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
        {!isFolder && <FileSemanticBadges item={item} />}
      </div>

      {isFolder && item.isExpanded && item.children && (
        <div className="collection-children">
          {item.children.map((child) => (
            <CollectionItem
              key={child.id}
              item={child}
              selectedId={selectedId}
              highlightedId={highlightedId}
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
