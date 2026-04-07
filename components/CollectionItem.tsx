'use client';

import React from 'react';
import { JkirCollection } from '../hooks/useCollections';
import {
  getDisplayDocumentRole,
  getDisplayResponseVariant,
  getSemanticDescription,
  isXmlFile,
} from '../utils/fileSemanticDisplay';

interface CollectionItemProps {
  item: JkirCollection;
  selectedId: string | null;
  highlightedId: string | null;
  level: number;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, item: JkirCollection) => void;
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9.5 4.5L13 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13 8H3M6.5 4.5L3 8l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BracketsJsonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5 3L3 5v6l2 2M11 3l2 2v6l-2 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XmlTagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4.5 12L2 8l2.5-4M11.5 12L14 8l-2.5-4M6 13l4-10"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileSemanticIcons({ item }: { item: JkirCollection }) {
  if (item.type !== 'file') return null;
  const role = getDisplayDocumentRole(item);
  const variant = getDisplayResponseVariant(item);
  const xml = isXmlFile(item);
  const title = getSemanticDescription(item);

  return (
    <span
      className="collection-semantic-icons"
      onClick={(e) => e.stopPropagation()}
      title={title}
      role="img"
      aria-label={title}
    >
      <span className={`collection-sem-format ${xml ? 'xml' : 'json'}`}>
        {xml ? <XmlTagIcon className="collection-sem-svg" /> : <BracketsJsonIcon className="collection-sem-svg" />}
      </span>
      <span className={`collection-sem-role ${role === 'request' ? 'request' : 'response'}`}>
        {role === 'request' ? (
          <ArrowRightIcon className="collection-sem-svg" />
        ) : (
          <ArrowLeftIcon className="collection-sem-svg" />
        )}
      </span>
      <span
        className={`collection-sem-dot ${variant === 'success' ? 'success' : variant === 'error' ? 'error' : 'business'}`}
      />
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
        {!isFolder && <FileSemanticIcons item={item} />}
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
