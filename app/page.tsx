'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import TabNavigation, { TabType } from '../components/TabNavigation';
import TreeView from '../components/TreeView';
import CodeView from '../components/CodeView';
import FlowView from '../components/FlowView';
import QueryView from '../components/QueryView';
import CollectionToolbar from '../components/CollectionToolbar';
import CollectionExplorer from '../components/CollectionExplorer';
import ThemeToggle from '../components/ThemeToggle';
import useCollections from '../hooks/useCollections';
import useTheme from '../hooks/useTheme';

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
  } = useCollections();

  const { theme, resolvedTheme, setTheme } = useTheme();

  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState<TabType>('tree');
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(DEFAULT_PANEL_WIDTH);

  const handleJsonParse = useCallback((data: unknown) => {
    setParsedJson(data);
  }, []);

  const handleContentChange = useCallback((content: string) => {
    if (selectedId) {
      updateFileContent(selectedId, content);
    }
  }, [selectedId, updateFileContent]);

  const handleFileSelect = useCallback((id: string) => {
    setSelectedId(id);
    setActiveTab('code');
  }, [setSelectedId]);

  const handleDataChange = useCallback((newData: unknown) => {
    setParsedJson(newData);
    if (selectedId) {
      const formatted = JSON.stringify(newData, null, 2);
      updateFileContent(selectedId, formatted);
    }
  }, [selectedId, updateFileContent]);

  const handleCreateFolder = useCallback((name: string, parentId?: string) => {
    createFolder(name, parentId);
  }, [createFolder]);

  const handleCreateFile = useCallback((name: string, parentId?: string) => {
    createFile(name, parentId);
  }, [createFile]);

  // Drag resize logic
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

  // Double click to toggle
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
          <CodeView
            file={selectedItem}
            onContentChange={handleContentChange}
            onJsonParse={handleJsonParse}
          />
        );
      case 'tree':
        return <TreeView data={parsedJson} onDataChange={handleDataChange} />;
      case 'flow':
        return <FlowView data={parsedJson} />;
      case 'query':
        return <QueryView data={parsedJson} />;
      default:
        return <TreeView data={parsedJson} onDataChange={handleDataChange} />;
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
          <h1>🔍 JSON Görüntüleyici</h1>
          <p className="header-subtitle">API JSON verilerini kolayca görselleştirin</p>
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
