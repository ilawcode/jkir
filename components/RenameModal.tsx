'use client';

import React, { useState, useRef, useEffect } from 'react';

interface RenameModalProps {
  currentName: string;
  itemType: 'folder' | 'file';
  onSubmit: (newName: string) => void;
  onCancel: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({
  currentName,
  itemType,
  onSubmit,
  onCancel,
}) => {
  // Remove .json extension for editing if it's a file
  const getEditableName = (name: string) => {
    if (itemType === 'file' && name.endsWith('.json')) {
      return name.slice(0, -5);
    }
    return name;
  };

  const [name, setName] = useState(getEditableName(currentName));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rename-modal-header">
          <h3>{itemType === 'folder' ? 'Klasörü' : 'Dosyayı'} Yeniden Adlandır</h3>
          <button className="window-close" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="rename-modal-body">
            <label htmlFor="rename-input">Yeni isim:</label>
            <div className="rename-input-wrapper">
              <input
                ref={inputRef}
                id="rename-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={itemType === 'folder' ? 'Klasör adı' : 'Dosya adı'}
              />
              {itemType === 'file' && <span className="file-extension">.json</span>}
            </div>
          </div>
          <div className="rename-modal-footer">
            <button type="button" className="btn-cancel-modal" onClick={onCancel}>
              İptal
            </button>
            <button type="submit" className="btn-save-modal" disabled={!name.trim()}>
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;
