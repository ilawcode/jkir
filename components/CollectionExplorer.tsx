'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { JkirCollection } from '../hooks/useCollections';
import CollectionItem from './CollectionItem';
import CollectionContextMenu from './CollectionContextMenu';
import RenameModal from './RenameModal';
import InputModal from './InputModal';

interface CollectionExplorerProps {
  collections: JkirCollection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCreateFile: (name: string, parentId?: string) => void;
  onCreateFolder: (name: string, parentId?: string) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  item: JkirCollection | null;
}

type InputModalType = 'newFile' | 'newFolder' | null;

const CollectionExplorer: React.FC<CollectionExplorerProps> = ({
  collections,
  selectedId,
  onSelect,
  onToggle,
  onRename,
  onDelete,
  onDuplicate,
  onCreateFile,
  onCreateFolder,
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });
  
  const [renameModal, setRenameModal] = useState<{
    visible: boolean;
    item: JkirCollection | null;
  }>({
    visible: false,
    item: null,
  });

  const [inputModal, setInputModal] = useState<{
    type: InputModalType;
    parentId: string | null;
  }>({
    type: null,
    parentId: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean;
    item: JkirCollection | null;
  }>({
    visible: false,
    item: null,
  });

  const handleContextMenu = useCallback((e: React.MouseEvent, item: JkirCollection) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleRenameClick = useCallback(() => {
    if (contextMenu.item) {
      setRenameModal({ visible: true, item: contextMenu.item });
    }
    closeContextMenu();
  }, [contextMenu.item, closeContextMenu]);

  const handleRenameSubmit = useCallback((newName: string) => {
    if (renameModal.item) {
      onRename(renameModal.item.id, newName);
    }
    setRenameModal({ visible: false, item: null });
  }, [renameModal.item, onRename]);

  const handleRenameCancel = useCallback(() => {
    setRenameModal({ visible: false, item: null });
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (contextMenu.item) {
      setDeleteConfirm({ visible: true, item: contextMenu.item });
    }
    closeContextMenu();
  }, [contextMenu.item, closeContextMenu]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirm.item) {
      onDelete(deleteConfirm.item.id);
    }
    setDeleteConfirm({ visible: false, item: null });
  }, [deleteConfirm.item, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ visible: false, item: null });
  }, []);

  const handleDuplicateClick = useCallback(() => {
    if (contextMenu.item) {
      onDuplicate(contextMenu.item.id);
    }
    closeContextMenu();
  }, [contextMenu.item, onDuplicate, closeContextMenu]);

  const handleNewFileClick = useCallback(() => {
    if (contextMenu.item && contextMenu.item.type === 'folder') {
      setInputModal({ type: 'newFile', parentId: contextMenu.item.id });
    }
    closeContextMenu();
  }, [contextMenu.item, closeContextMenu]);

  const handleNewFolderClick = useCallback(() => {
    if (contextMenu.item && contextMenu.item.type === 'folder') {
      setInputModal({ type: 'newFolder', parentId: contextMenu.item.id });
    }
    closeContextMenu();
  }, [contextMenu.item, closeContextMenu]);

  const handleInputModalSubmit = useCallback((name: string) => {
    if (inputModal.type === 'newFile') {
      onCreateFile(name, inputModal.parentId || undefined);
    } else if (inputModal.type === 'newFolder') {
      onCreateFolder(name, inputModal.parentId || undefined);
    }
    setInputModal({ type: null, parentId: null });
  }, [inputModal, onCreateFile, onCreateFolder]);

  const handleInputModalCancel = useCallback(() => {
    setInputModal({ type: null, parentId: null });
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible, closeContextMenu]);

  return (
    <div className="collection-explorer">
      {collections.length === 0 ? (
        <div className="collection-empty">
          <p>Henüz koleksiyon yok</p>
          <p className="text-muted small">Yeni klasör veya dosya ekleyin</p>
        </div>
      ) : (
        <div className="collection-tree">
          {collections.map((item) => (
            <CollectionItem
              key={item.id}
              item={item}
              selectedId={selectedId}
              level={0}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={handleContextMenu}
            />
          ))}
        </div>
      )}

      {contextMenu.visible && contextMenu.item && (
        <CollectionContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onRename={handleRenameClick}
          onDelete={handleDeleteClick}
          onDuplicate={handleDuplicateClick}
          onNewFile={handleNewFileClick}
          onNewFolder={handleNewFolderClick}
          onClose={closeContextMenu}
        />
      )}

      {renameModal.visible && renameModal.item && (
        <RenameModal
          currentName={renameModal.item.name}
          itemType={renameModal.item.type}
          onSubmit={handleRenameSubmit}
          onCancel={handleRenameCancel}
        />
      )}

      {inputModal.type === 'newFile' && (
        <InputModal
          title="Yeni Dosya"
          label="Dosya adı:"
          placeholder="Dosya adını girin"
          defaultValue="new-file"
          suffix=".json"
          onSubmit={handleInputModalSubmit}
          onCancel={handleInputModalCancel}
        />
      )}

      {inputModal.type === 'newFolder' && (
        <InputModal
          title="Yeni Klasör"
          label="Klasör adı:"
          placeholder="Klasör adını girin"
          defaultValue="New Folder"
          onSubmit={handleInputModalSubmit}
          onCancel={handleInputModalCancel}
        />
      )}

      {deleteConfirm.visible && deleteConfirm.item && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rename-modal-header">
              <h3>Silme Onayı</h3>
              <button className="window-close" onClick={handleDeleteCancel}>×</button>
            </div>
            <div className="rename-modal-body">
              <p style={{ margin: 0, fontSize: '14px' }}>
                <strong>&quot;{deleteConfirm.item.name}&quot;</strong> silinsin mi?
              </p>
              {deleteConfirm.item.type === 'folder' && deleteConfirm.item.children && deleteConfirm.item.children.length > 0 && (
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc3545' }}>
                  ⚠️ Bu klasör {deleteConfirm.item.children.length} öğe içeriyor. Tüm içerik silinecek.
                </p>
              )}
            </div>
            <div className="rename-modal-footer">
              <button type="button" className="btn-cancel-modal" onClick={handleDeleteCancel}>
                İptal
              </button>
              <button 
                type="button" 
                className="btn-save-modal" 
                style={{ background: '#dc3545' }}
                onClick={handleDeleteConfirm}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionExplorer;
