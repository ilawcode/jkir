'use client';

import React, { useRef, useEffect } from 'react';
import { JkirCollection } from '../hooks/useCollections';

interface CollectionContextMenuProps {
  x: number;
  y: number;
  item: JkirCollection;
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onClose: () => void;
}

const CollectionContextMenu: React.FC<CollectionContextMenuProps> = ({
  x,
  y,
  item,
  onRename,
  onDelete,
  onDuplicate,
  onNewFile,
  onNewFolder,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isFolder = item.type === 'folder';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Adjust position if menu would overflow viewport
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      
      if (rect.right > window.innerWidth) {
        menu.style.left = `${window.innerWidth - rect.width - 10}px`;
      }
      
      if (rect.bottom > window.innerHeight) {
        menu.style.top = `${window.innerHeight - rect.height - 10}px`;
      }
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="collection-context-menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isFolder && (
        <>
          <button className="context-menu-item" onClick={onNewFile}>
            <span className="context-icon">📄</span>
            <span>Yeni Dosya</span>
          </button>
          <button className="context-menu-item" onClick={onNewFolder}>
            <span className="context-icon">📁</span>
            <span>Yeni Klasör</span>
          </button>
          <div className="context-menu-divider" />
        </>
      )}
      
      <button className="context-menu-item" onClick={onRename}>
        <span className="context-icon">✏️</span>
        <span>Yeniden Adlandır</span>
      </button>
      
      <button className="context-menu-item" onClick={onDuplicate}>
        <span className="context-icon">📋</span>
        <span>Kopyala</span>
      </button>
      
      <div className="context-menu-divider" />
      
      <button className="context-menu-item danger" onClick={onDelete}>
        <span className="context-icon">🗑️</span>
        <span>Sil</span>
      </button>
    </div>
  );
};

export default CollectionContextMenu;
