'use client';

import { useState, useCallback } from 'react';
import TabNavigation, { TabType } from '../components/TabNavigation';
import TreeView from '../components/TreeView';
import CodeView from '../components/CodeView';
import FlowView from '../components/FlowView';
import QueryView from '../components/QueryView';
import ThemeToggle from '../components/ThemeToggle';
import useTheme from '../hooks/useTheme';

export default function Home() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState<TabType>('code');

  const handleJsonParse = useCallback((data: unknown) => {
    setParsedJson(data);
  }, []);

  const handleDataChange = useCallback((newData: unknown) => {
    setParsedJson(newData);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'code':
        return <CodeView data={parsedJson} onJsonParse={handleJsonParse} />;
      case 'tree':
        return <TreeView data={parsedJson} onDataChange={handleDataChange} />;
      case 'flow':
        return <FlowView data={parsedJson} />;
      case 'query':
        return <QueryView data={parsedJson} />;
      default:
        return <CodeView data={parsedJson} onJsonParse={handleJsonParse} />;
    }
  };

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

      {/* Main Content - Single Panel */}
      <div className="container-fluid flex-grow-1 p-0 d-flex flex-column">
        <div className="view-panel h-100 d-flex flex-column">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="tab-content flex-grow-1 overflow-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
