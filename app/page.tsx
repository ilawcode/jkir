'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import TabNavigation, { TabType } from '../components/TabNavigation';
import TreeView from '../components/TreeView';
import SplitCodeView from '../components/SplitCodeView';
import FlowView from '../components/FlowView';
import QueryView from '../components/QueryView';
import CollectionToolbar from '../components/CollectionToolbar';
import CollectionExplorer from '../components/CollectionExplorer';
import ThemeToggle from '../components/ThemeToggle';
import useCollections from '../hooks/useCollections';
import useTheme from '../hooks/useTheme';
import { objectToXml, formatXml } from '../utils/xmlParser';

const MIN_PANEL_WIDTH = 180;
const DEFAULT_PANEL_WIDTH = 280;
const SNAP_THRESHOLD = 60;

export default function Home() {
  const {
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
    expandToItem,
    searchCollections,
    findItemById,
  } = useCollections();

  const { theme, resolvedTheme, setTheme } = useTheme();

  // Split editor state
  const [openFiles, setOpenFiles] = useState<{ left: string | null; right: string | null }>({
    left: null,
    right: null,
  });
  const [activePane, setActivePane] = useState<'left' | 'right'>('left');
  const [parsedJsonLeft, setParsedJsonLeft] = useState<unknown>(null);
  const [parsedJsonRight, setParsedJsonRight] = useState<unknown>(null);

  const [activeTab, setActiveTab] = useState<TabType>('tree');
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(DEFAULT_PANEL_WIDTH);

  // Derive files from openFiles state
  const leftFile = openFiles.left ? findItemById(collections, openFiles.left) : null;
  const rightFile = openFiles.right ? findItemById(collections, openFiles.right) : null;
  const activeParsedJson = activePane === 'left' ? parsedJsonLeft : parsedJsonRight;

  // Sync selectedId from localStorage on initial load
  useEffect(() => {
    if (isLoaded && selectedId && !openFiles.left && !openFiles.right) {
      setOpenFiles({ left: selectedId, right: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // Clean up openFiles when items are deleted from collections
  useEffect(() => {
    if (!isLoaded) return;
    setOpenFiles(prev => {
      const leftExists = prev.left ? findItemById(collections, prev.left) : null;
      const rightExists = prev.right ? findItemById(collections, prev.right) : null;

      if (leftExists && rightExists) return prev;
      if (!leftExists && !rightExists) return { left: null, right: null };
      if (!leftExists && rightExists) return { left: prev.right, right: null };
      if (leftExists && !rightExists && prev.right !== null) return { left: prev.left, right: null };
      return prev;
    });
  }, [collections, findItemById, isLoaded]);

  // JSON parse handlers for each pane
  const handleLeftJsonParse = useCallback((data: unknown) => {
    setParsedJsonLeft(data);
  }, []);

  const handleRightJsonParse = useCallback((data: unknown) => {
    setParsedJsonRight(data);
  }, []);

  // Content change handlers for each pane
  const handleLeftContentChange = useCallback((content: string) => {
    if (openFiles.left) {
      updateFileContent(openFiles.left, content);
    }
  }, [openFiles.left, updateFileContent]);

  const handleRightContentChange = useCallback((content: string) => {
    if (openFiles.right) {
      updateFileContent(openFiles.right, content);
    }
  }, [openFiles.right, updateFileContent]);

  // Normal file selection - opens in left pane only (single editor)
  const handleFileSelect = useCallback((id: string) => {
    setSelectedId(id);

    // Only open files in code panes, not folders
    const item = findItemById(collections, id);
    if (!item || item.type !== 'file') return;

    setActiveTab('code');
    setActivePane('left');

    setOpenFiles(prev => {
      // If file is already in the right pane, activate it there instead
      if (prev.right === id) {
        setActivePane('right');
        return prev;
      }
      // Open/replace in left pane, keep right pane as-is
      return { ...prev, left: id };
    });
  }, [setSelectedId, findItemById, collections]);

  // Open file in split (right pane) - triggered from context menu
  const handleOpenInSplit = useCallback((id: string) => {
    const item = findItemById(collections, id);
    if (!item || item.type !== 'file') return;

    setSelectedId(id);
    setActiveTab('code');
    setActivePane('right');

    setOpenFiles(prev => {
      // If file is already open in the left pane, don't duplicate
      if (prev.left === id) {
        setActivePane('left');
        return prev;
      }
      // If no file in left yet, put this in left instead
      if (!prev.left) {
        setActivePane('left');
        return { left: id, right: null };
      }
      // Open/replace in right pane
      return { ...prev, right: id };
    });
  }, [setSelectedId, findItemById, collections]);

  // Close pane handlers
  const handleCloseLeft = useCallback(() => {
    setOpenFiles(prev => {
      if (prev.right) {
        // Move right to left
        setParsedJsonLeft(parsedJsonRight);
        setParsedJsonRight(null);
        setActivePane('left');
        if (prev.right) setSelectedId(prev.right);
        return { left: prev.right, right: null };
      }
      setSelectedId(null);
      setParsedJsonLeft(null);
      return { left: null, right: null };
    });
  }, [parsedJsonRight, setSelectedId]);

  const handleCloseRight = useCallback(() => {
    setOpenFiles(prev => {
      setActivePane('left');
      setParsedJsonRight(null);
      if (prev.left) setSelectedId(prev.left);
      return { ...prev, right: null };
    });
  }, [setSelectedId]);

  // Active pane change
  const handleActivePaneChange = useCallback((pane: 'left' | 'right') => {
    setActivePane(pane);
    const fileId = pane === 'left' ? openFiles.left : openFiles.right;
    if (fileId) setSelectedId(fileId);
  }, [openFiles, setSelectedId]);

  // Data change from tree view (edits in tree/flow/query apply to active pane)
  const handleDataChange = useCallback((newData: unknown) => {
    const currentFileId = activePane === 'left' ? openFiles.left : openFiles.right;
    const currentFile = activePane === 'left' ? leftFile : rightFile;

    if (activePane === 'left') {
      setParsedJsonLeft(newData);
    } else {
      setParsedJsonRight(newData);
    }

    if (currentFileId && currentFile) {
      const isXml = currentFile.fileType === 'xml' || currentFile.name.toLowerCase().endsWith('.xml');
      if (isXml) {
        try {
          const xmlStr = objectToXml(newData);
          const formatted = formatXml(xmlStr);
          updateFileContent(currentFileId, formatted);
        } catch {
          const formatted = JSON.stringify(newData, null, 2);
          updateFileContent(currentFileId, formatted);
        }
      } else {
        const formatted = JSON.stringify(newData, null, 2);
        updateFileContent(currentFileId, formatted);
      }
    }
  }, [activePane, openFiles, leftFile, rightFile, updateFileContent]);

  const handleCreateFolder = useCallback((name: string, parentId?: string) => {
    createFolder(name, parentId);
  }, [createFolder]);

  const handleCreateFile = useCallback((name: string, parentId?: string) => {
    createFile(name, parentId);
  }, [createFile]);

  // Drag resize logic (sidebar)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      if (newWidth < SNAP_THRESHOLD) {
        setIsCollapsed(true);
        setSidebarWidth(0);
      } else {
        setIsCollapsed(false);
        const clampedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(newWidth, containerRect.width * 0.5));
        setSidebarWidth(clampedWidth);
        lastWidthRef.current = clampedWidth;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Double click to toggle sidebar
  const handleDoubleClick = useCallback(() => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setSidebarWidth(lastWidthRef.current || DEFAULT_PANEL_WIDTH);
    } else {
      lastWidthRef.current = sidebarWidth;
      setIsCollapsed(true);
      setSidebarWidth(0);
    }
  }, [isCollapsed, sidebarWidth]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'code':
        return (
          <SplitCodeView
            leftFile={leftFile}
            rightFile={rightFile}
            activePane={activePane}
            onActivePaneChange={handleActivePaneChange}
            onLeftContentChange={handleLeftContentChange}
            onRightContentChange={handleRightContentChange}
            onLeftJsonParse={handleLeftJsonParse}
            onRightJsonParse={handleRightJsonParse}
            onCloseLeft={handleCloseLeft}
            onCloseRight={handleCloseRight}
          />
        );
      case 'tree':
        return <TreeView data={activeParsedJson} onDataChange={handleDataChange} />;
      case 'flow':
        return <FlowView data={activeParsedJson} />;
      case 'query':
        return <QueryView data={activeParsedJson} />;
      default:
        return <TreeView data={activeParsedJson} onDataChange={handleDataChange} />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>🔍 Veri Görüntüleyici</h1>
          <p className="header-subtitle">JSON &amp; XML verilerini kolayca görselleştirin</p>
        </div>
        <div className="header-right">
          <ThemeToggle
            theme={theme}
            resolvedTheme={resolvedTheme}
            onThemeChange={setTheme}
          />
        </div>
      </header>

      {/* Main Content - Resizable Split */}
      <div className="split-layout" ref={containerRef}>
        {/* Left Panel */}
        <div
          className="split-left-panel"
          style={{ width: isCollapsed ? 0 : sidebarWidth, minWidth: isCollapsed ? 0 : MIN_PANEL_WIDTH }}
        >
          <div className="left-panel-container">
            <CollectionToolbar
              onCreateFolder={(name) => handleCreateFolder(name)}
              onCreateFile={(name) => handleCreateFile(name)}
              onExport={exportCollections}
              onImport={importCollections}
            />
            <div className="collection-explorer-wrapper">
              <CollectionExplorer
                collections={collections}
                selectedId={selectedId}
                onSelect={handleFileSelect}
                onToggle={toggleFolder}
                onRename={renameItem}
                onDelete={deleteItem}
                onDuplicate={duplicateItem}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onExpandToItem={expandToItem}
                onSearch={searchCollections}
                onOpenInSplit={handleOpenInSplit}
              />
            </div>
          </div>
        </div>

        {/* Resizer Handle */}
        <div
          className={`split-resizer ${isDragging ? 'dragging' : ''} ${isCollapsed ? 'collapsed' : ''}`}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          title="Sürükle: boyutlandır · Çift tıkla: aç/kapat"
        >
          <div className="resizer-grip">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="split-right-panel">
          <div className="view-panel h-100 d-flex flex-column">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="tab-content flex-grow-1 overflow-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
