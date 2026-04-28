import React from 'react';
import { AppMode } from '../hooks/useAppMode';

interface ModeSwitcherProps {
  mode: AppMode;
  onSwitchMode: (mode: 'simple' | 'workspace') => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onSwitchMode }) => {
  if (!mode) return null;

  return (
    <div className="mode-switcher-container">
      <style>{`
        .mode-switcher-container {
          display: flex;
          background: rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          padding: 3px;
          margin-right: 12px;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .mode-switcher-btn {
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mode-switcher-btn:hover {
          color: white;
        }

        .mode-switcher-btn.active {
          background: rgba(255, 255, 255, 0.25);
          color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .mode-icon {
          font-size: 14px;
        }
      `}</style>

      <button
        className={`mode-switcher-btn ${mode === 'workspace' ? 'active' : ''}`}
        onClick={() => onSwitchMode('workspace')}
        title="Workspace Mode"
      >
        <span className="mode-icon">📁</span>
        Workspace
      </button>

      <button
        className={`mode-switcher-btn ${mode === 'simple' ? 'active' : ''}`}
        onClick={() => onSwitchMode('simple')}
        title="Simple Mode"
      >
        <span className="mode-icon">⚡</span>
        Simple
      </button>
    </div>
  );
};

export default ModeSwitcher;
