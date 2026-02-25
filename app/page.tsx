'use client';

import { useState, useCallback } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleJsonParse = useCallback((data: unknown) => {
    setParsedJson(data);
  }, []);

  const handleContentChange = useCallback((content: string) => {
    if (selectedId) {
      updateFileContent(selectedId, content);
    }
  }, [selectedId, updateFileContent]);

  // Auto-switch to code tab when a file is selected
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

      {/* Main Content - Split Screen */}
      <div className="container-fluid flex-grow-1 p-0 split-container position-relative">
        {/* Toggle Sidebar Button */}
        <button
          className={`sidebar-toggle ${!isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Paneli Gizle" : "Paneli Göster"}
        >
          {isSidebarOpen ? '◀' : '▶'}
        </button>

        <div className="row g-0 h-100 flex-nowrap">
          {/* Left Panel - Collection Explorer & File Editor */}
          <div className={`col-md-5 split-panel left-panel ${!isSidebarOpen ? 'collapsed' : ''}`}>
            <div className="left-panel-container">
              {/* Collection Toolbar */}
              <CollectionToolbar
                onCreateFolder={(name) => handleCreateFolder(name)}
                onCreateFile={(name) => handleCreateFile(name)}
                onExport={exportCollections}
                onImport={importCollections}
              />

              {/* Collection Explorer */}
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

          {/* Right Panel - Tabbed Views */}
          <div className={`split-panel right-panel p-0 ${!isSidebarOpen ? 'expanded col-md-12' : 'col-md-7'}`}>
            <div className="view-panel h-100 d-flex flex-column">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="tab-content flex-grow-1 overflow-auto">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
