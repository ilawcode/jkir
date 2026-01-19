'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'jkir-collections';

export interface JkirCollection {
  id: string;
  name: string;
  type: 'folder' | 'file';
  content?: string;
  children?: JkirCollection[];
  createdAt: number;
  updatedAt: number;
  isExpanded?: boolean;
}

export interface CollectionsState {
  collections: JkirCollection[];
  selectedId: string | null;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getDefaultCollections = (): JkirCollection[] => {
  return [
    {
      id: generateId(),
      name: 'My Collection',
      type: 'folder',
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isExpanded: true,
    },
  ];
};

export const useCollections = () => {
  const [collections, setCollections] = useState<JkirCollection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CollectionsState;
        setCollections(parsed.collections || []);
        setSelectedId(parsed.selectedId || null);
      } else {
        setCollections(getDefaultCollections());
      }
    } catch (e) {
      console.error('Failed to load collections:', e);
      setCollections(getDefaultCollections());
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when collections change
  useEffect(() => {
    if (isLoaded) {
      try {
        const state: CollectionsState = { collections, selectedId };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save collections:', e);
      }
    }
  }, [collections, selectedId, isLoaded]);

  // Find item by ID recursively
  const findItemById = useCallback((items: JkirCollection[], id: string): JkirCollection | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Find parent of item by ID
  const findParentById = useCallback((items: JkirCollection[], id: string, parent: JkirCollection | null = null): JkirCollection | null => {
    for (const item of items) {
      if (item.id === id) return parent;
      if (item.children) {
        const found = findParentById(item.children, id, item);
        if (found !== undefined) return found;
      }
    }
    return null;
  }, []);

  // Get selected item
  const selectedItem = selectedId ? findItemById(collections, selectedId) : null;

  // Create new folder
  const createFolder = useCallback((name: string, parentId?: string) => {
    const newFolder: JkirCollection = {
      id: generateId(),
      name,
      type: 'folder',
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isExpanded: false,
    };

    setCollections((prev) => {
      if (!parentId) {
        return [...prev, newFolder];
      }

      const updateChildren = (items: JkirCollection[]): JkirCollection[] => {
        return items.map((item) => {
          if (item.id === parentId && item.type === 'folder') {
            return {
              ...item,
              children: [...(item.children || []), newFolder],
              updatedAt: Date.now(),
              isExpanded: true,
            };
          }
          if (item.children) {
            return { ...item, children: updateChildren(item.children) };
          }
          return item;
        });
      };

      return updateChildren(prev);
    });

    return newFolder.id;
  }, []);

  // Create new file
  const createFile = useCallback((name: string, parentId?: string, content: string = '{}') => {
    const newFile: JkirCollection = {
      id: generateId(),
      name: name.endsWith('.json') ? name : `${name}.json`,
      type: 'file',
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCollections((prev) => {
      if (!parentId) {
        return [...prev, newFile];
      }

      const updateChildren = (items: JkirCollection[]): JkirCollection[] => {
        return items.map((item) => {
          if (item.id === parentId && item.type === 'folder') {
            return {
              ...item,
              children: [...(item.children || []), newFile],
              updatedAt: Date.now(),
              isExpanded: true,
            };
          }
          if (item.children) {
            return { ...item, children: updateChildren(item.children) };
          }
          return item;
        });
      };

      return updateChildren(prev);
    });

    setSelectedId(newFile.id);
    return newFile.id;
  }, []);

  // Rename item
  const renameItem = useCallback((id: string, newName: string) => {
    setCollections((prev) => {
      const updateItem = (items: JkirCollection[]): JkirCollection[] => {
        return items.map((item) => {
          if (item.id === id) {
            const finalName = item.type === 'file' && !newName.endsWith('.json') 
              ? `${newName}.json` 
              : newName;
            return { ...item, name: finalName, updatedAt: Date.now() };
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) };
          }
          return item;
        });
      };
      return updateItem(prev);
    });
  }, []);

  // Delete item
  const deleteItem = useCallback((id: string) => {
    setCollections((prev) => {
      const removeItem = (items: JkirCollection[]): JkirCollection[] => {
        return items
          .filter((item) => item.id !== id)
          .map((item) => {
            if (item.children) {
              return { ...item, children: removeItem(item.children) };
            }
            return item;
          });
      };
      return removeItem(prev);
    });

    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  // Update file content
  const updateFileContent = useCallback((id: string, content: string) => {
    setCollections((prev) => {
      const updateItem = (items: JkirCollection[]): JkirCollection[] => {
        return items.map((item) => {
          if (item.id === id && item.type === 'file') {
            return { ...item, content, updatedAt: Date.now() };
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) };
          }
          return item;
        });
      };
      return updateItem(prev);
    });
  }, []);

  // Toggle folder expand/collapse
  const toggleFolder = useCallback((id: string) => {
    setCollections((prev) => {
      const updateItem = (items: JkirCollection[]): JkirCollection[] => {
        return items.map((item) => {
          if (item.id === id && item.type === 'folder') {
            return { ...item, isExpanded: !item.isExpanded };
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) };
          }
          return item;
        });
      };
      return updateItem(prev);
    });
  }, []);

  // Duplicate item
  const duplicateItem = useCallback((id: string) => {
    const item = findItemById(collections, id);
    if (!item) return;

    const duplicateRecursive = (original: JkirCollection): JkirCollection => {
      const newItem: JkirCollection = {
        ...original,
        id: generateId(),
        name: `${original.name.replace(/\.json$/, '')} (copy)${original.type === 'file' ? '.json' : ''}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (original.children) {
        newItem.children = original.children.map(duplicateRecursive);
      }

      return newItem;
    };

    const newItem = duplicateRecursive(item);
    const parent = findParentById(collections, id);

    setCollections((prev) => {
      if (!parent) {
        return [...prev, newItem];
      }

      const addToParent = (items: JkirCollection[]): JkirCollection[] => {
        return items.map((i) => {
          if (i.id === parent.id) {
            return { ...i, children: [...(i.children || []), newItem] };
          }
          if (i.children) {
            return { ...i, children: addToParent(i.children) };
          }
          return i;
        });
      };

      return addToParent(prev);
    });

    return newItem.id;
  }, [collections, findItemById, findParentById]);

  // Export collections to JSON
  const exportCollections = useCallback(() => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      collections,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jkir-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [collections]);

  // Import collections from JSON
  const importCollections = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (data.collections && Array.isArray(data.collections)) {
            setCollections((prev) => [...prev, ...data.collections]);
            resolve();
          } else if (Array.isArray(data)) {
            // Direct array of collections
            setCollections((prev) => [...prev, ...data]);
            resolve();
          } else {
            reject(new Error('Geçersiz dosya formatı'));
          }
        } catch (error) {
          reject(new Error('Dosya okunamadı'));
        }
      };
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsText(file);
    });
  }, []);

  // Clear all collections
  const clearAll = useCallback(() => {
    setCollections(getDefaultCollections());
    setSelectedId(null);
  }, []);

  // Get all ancestor IDs for a given item
  const getAncestorIds = useCallback((id: string): string[] => {
    const ancestors: string[] = [];
    
    const findAncestors = (items: JkirCollection[], targetId: string, path: string[]): boolean => {
      for (const item of items) {
        if (item.id === targetId) {
          ancestors.push(...path);
          return true;
        }
        if (item.children) {
          if (findAncestors(item.children, targetId, [...path, item.id])) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAncestors(collections, id, []);
    return ancestors;
  }, [collections]);

  // Expand all ancestor folders for a given item
  const expandToItem = useCallback((id: string) => {
    const ancestors = getAncestorIds(id);
    if (ancestors.length === 0) return;

    setCollections((prev) => {
      const expandFolders = (items: JkirCollection[]): JkirCollection[] => {
        return items.map((item) => {
          if (ancestors.includes(item.id) && item.type === 'folder') {
            return { 
              ...item, 
              isExpanded: true,
              children: item.children ? expandFolders(item.children) : item.children
            };
          }
          if (item.children) {
            return { ...item, children: expandFolders(item.children) };
          }
          return item;
        });
      };
      return expandFolders(prev);
    });
  }, [getAncestorIds]);

  // Search collections by name
  const searchCollections = useCallback((query: string): JkirCollection[] => {
    if (!query.trim()) return [];
    
    const results: JkirCollection[] = [];
    const lowerQuery = query.toLowerCase();
    
    const searchRecursive = (items: JkirCollection[]) => {
      for (const item of items) {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          results.push(item);
        }
        if (item.children) {
          searchRecursive(item.children);
        }
      }
    };
    
    searchRecursive(collections);
    return results;
  }, [collections]);

  return {
    collections,
    selectedId,
    selectedItem,
    isLoaded,
    setSelectedId,
    createFolder,
    createFile,
    renameItem,
    deleteItem,
    updateFileContent,
    toggleFolder,
    duplicateItem,
    exportCollections,
    importCollections,
    clearAll,
    findItemById,
    expandToItem,
    searchCollections,
  };
};

export default useCollections;
