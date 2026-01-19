'use client';

import React from 'react';
import { Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  onThemeChange: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  resolvedTheme,
  onThemeChange,
}) => {
  return (
    <div className="theme-toggle-wrapper">
      <div className="theme-toggle-buttons">
        <button
          className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
          onClick={() => onThemeChange('light')}
          title="Açık Tema"
        >
          ☀️
        </button>
        <button
          className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => onThemeChange('dark')}
          title="Koyu Tema"
        >
          🌙
        </button>
        <button
          className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
          onClick={() => onThemeChange('system')}
          title="Sistem Teması"
        >
          💻
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
