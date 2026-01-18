'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import JsonInput, { JsonInputRef } from '../components/JsonInput';
import TabNavigation, { TabType } from '../components/TabNavigation';
import TreeView from '../components/TreeView';
import CodeView from '../components/CodeView';
import FlowView from '../components/FlowView';
import QueryView from '../components/QueryView';

const STORAGE_KEY = 'json-viewer-data';

export default function Home() {
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [inputText, setInputText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('tree');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const jsonInputRef = useRef<JsonInputRef>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setParsedJson(parsed);
        setInputText(saved);
      } catch {
        setInputText(saved);
      }
    }
  }, []);

  const handleJsonParse = useCallback((data: unknown) => {
    setParsedJson(data);
    if (data !== null) {
      const formatted = JSON.stringify(data, null, 2);
      setInputText(formatted);
    }
  }, []);

  const handleDataChange = useCallback((newData: unknown) => {
    setParsedJson(newData);
    const formatted = JSON.stringify(newData, null, 2);
    setInputText(formatted);
    localStorage.setItem(STORAGE_KEY, formatted);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'code':
        return <CodeView data={parsedJson} />;
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

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <header className="app-header">
        <h1>🔍 JSON Görüntüleyici</h1>
        <p className="mb-0 opacity-75">API JSON verilerini kolayca görselleştirin</p>
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
          {/* Left Panel - JSON Input */}
          <div className={`col-md-5 split-panel left-panel ${!isSidebarOpen ? 'collapsed' : ''}`}>
            <JsonInput
              ref={jsonInputRef}
              onJsonParse={handleJsonParse}
              externalValue={inputText}
            />
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
