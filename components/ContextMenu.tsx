'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    onEdit: () => void;
    onCreateTable: () => void;
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onEdit, onCreateTable, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                position: 'fixed',
                left: x,
                top: y,
                zIndex: 1000
            }}
        >
            <button className="context-menu-item" onClick={onEdit}>
                ✏️ Düzenle
            </button>
            <button className="context-menu-item" onClick={onCreateTable}>
                📊 Tablo Oluştur
            </button>
        </div>
    );
};

export default ContextMenu;
