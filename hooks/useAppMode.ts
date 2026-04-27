import { useState, useEffect, useCallback } from 'react';

export type AppMode = 'simple' | 'workspace' | null;

export default function useAppMode() {
  const [mode, setMode] = useState<AppMode>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    try {
      const storedMode = localStorage.getItem('app_default_mode') as AppMode;
      if (storedMode === 'simple' || storedMode === 'workspace') {
        setMode(storedMode);
      }
    } catch (e) {
      console.warn('Failed to read app_default_mode from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const selectMode = useCallback((newMode: 'simple' | 'workspace', remember: boolean) => {
    setMode(newMode);
    if (remember) {
      try {
        localStorage.setItem('app_default_mode', newMode);
      } catch (e) {
        console.warn('Failed to save app_default_mode to localStorage', e);
      }
    } else {
      try {
        localStorage.removeItem('app_default_mode');
      } catch (e) {
        console.warn('Failed to remove app_default_mode from localStorage', e);
      }
    }
  }, []);

  const switchMode = useCallback((newMode: 'simple' | 'workspace') => {
    setMode(newMode);
    // When manually switching mode, we usually don't want to enforce it as the new permanent default unless checked,
    // but to be safe we can just leave localStorage as is, or remove it. Let's just remove it to be safe 
    // so next time they open the app they are asked again, OR we can just keep the previous default.
    // Let's keep the previous default as it was, just change current session mode.
  }, []);

  return { mode, isLoaded, selectMode, switchMode };
}
