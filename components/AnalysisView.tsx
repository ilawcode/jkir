'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisViewProps {
  markdown: string;
  onClose?: () => void;
}

/** Normalize Confluence table header (|| a || b ||) to markdown (| a | b |) for rendering */
function normalizeConfluenceTables(md: string): string {
  return md.replace(/^\|\|(.+)\|\|$/gm, (_, row) => {
    const cells = row.split(/\|\|/).map((c: string) => c.trim()).filter(Boolean);
    return '| ' + cells.join(' | ') + ' |';
  });
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ markdown, onClose }) => {
  const [viewMode, setViewMode] = useState<'markdown' | 'preview'>('preview');
  const normalized = normalizeConfluenceTables(markdown);

  return (
    <div className="analysis-view">
      <div className="analysis-view-toolbar">
        <div className="analysis-view-switch">
          <button
            type="button"
            className={viewMode === 'markdown' ? 'active' : ''}
            onClick={() => setViewMode('markdown')}
          >
            Markdown
          </button>
          <button
            type="button"
            className={viewMode === 'preview' ? 'active' : ''}
            onClick={() => setViewMode('preview')}
          >
            Önizleme
          </button>
        </div>
        {onClose && (
          <button type="button" className="btn-close-analysis" onClick={onClose}>
            Kapat
          </button>
        )}
      </div>
      <div className="analysis-view-content">
        {viewMode === 'markdown' ? (
          <pre className="analysis-markdown-raw">{markdown}</pre>
        ) : (
          <div className="analysis-markdown-preview">
            <ReactMarkdown>{normalized}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
