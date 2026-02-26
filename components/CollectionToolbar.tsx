'use client';

import React, { useRef, useState } from 'react';
import InputModal from './InputModal';

interface CollectionToolbarProps {
  onCreateFolder: (name: string) => void;
  onCreateFile: (name: string) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

type ModalType = 'folder' | 'file' | null;

const CollectionToolbar: React.FC<CollectionToolbarProps> = ({
  onCreateFolder,
  onCreateFile,
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);

  const handleNewFolder = () => {
    setModalType('folder');
  };

  const handleNewFile = () => {
    setModalType('file');
  };

  const handleModalSubmit = (name: string) => {
    if (modalType === 'folder') {
      onCreateFolder(name);
    } else if (modalType === 'file') {
      onCreateFile(name);
    }
    setModalType(null);
  };

  const handleModalCancel = () => {
    setModalType(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      try {
        await onImport(file);
      } catch (error) {
        console.error('Import error:', error);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <>
      <div className="collection-toolbar">
        <div className="toolbar-left">
          <button
            className="toolbar-action-btn"
            onClick={handleNewFolder}
            title="Yeni Klasör"
          >
            <span className="toolbar-icon">📁</span>
            <span className="toolbar-text">Klasör</span>
          </button>
          <button
            className="toolbar-action-btn"
            onClick={handleNewFile}
            title="Yeni Dosya"
          >
            <span className="toolbar-icon">📄</span>
            <span className="toolbar-text">Dosya</span>
          </button>
        </div>

        <div className="toolbar-right">
          <button
            className="toolbar-action-btn"
            onClick={handleImportClick}
            disabled={isImporting}
            title="Import"
          >
            <span className="toolbar-icon">📥</span>
            <span className="toolbar-text">{isImporting ? '...' : 'Import'}</span>
          </button>
          <button
            className="toolbar-action-btn"
            onClick={onExport}
            title="Export"
          >
            <span className="toolbar-icon">📤</span>
            <span className="toolbar-text">Export</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xml"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {modalType === 'folder' && (
        <InputModal
          title="Yeni Klasör"
          label="Klasör adı:"
          placeholder="Klasör adını girin"
          defaultValue="New Folder"
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
        />
      )}

      {modalType === 'file' && (
        <InputModal
          title="Yeni Dosya"
          label="Dosya adı (.json veya .xml):"
          placeholder="örn: data.json veya config.xml"
          defaultValue="new-file.json"
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
        />
      )}
    </>
  );
};

export default CollectionToolbar;
