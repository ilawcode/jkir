'use client';

import React, { useState, useRef, useEffect } from 'react';

interface InputModalProps {
  title: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  suffix?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

const InputModal: React.FC<InputModalProps> = ({
  title,
  label,
  placeholder,
  defaultValue = '',
  suffix,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
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
          <h3>{title}</h3>
          <button className="window-close" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="rename-modal-body">
            <label htmlFor="input-modal-field">{label}</label>
            <div className="rename-input-wrapper">
              <input
                ref={inputRef}
                id="input-modal-field"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
              />
              {suffix && <span className="file-extension">{suffix}</span>}
            </div>
          </div>
          <div className="rename-modal-footer">
            <button type="button" className="btn-cancel-modal" onClick={onCancel}>
              İptal
            </button>
            <button type="submit" className="btn-save-modal" disabled={!value.trim()}>
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal;
