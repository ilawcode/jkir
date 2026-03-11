'use client';

import React, { useState, useEffect, useRef } from 'react';
import { JkirCollection } from '../hooks/useCollections';
import CodeView from './CodeView';

interface SplitCodeViewProps {
    leftFile: JkirCollection | null;
    rightFile: JkirCollection | null;
    activePane: 'left' | 'right';
    onActivePaneChange: (pane: 'left' | 'right') => void;
    onLeftContentChange: (content: string) => void;
    onRightContentChange: (content: string) => void;
    onLeftJsonParse: (data: unknown) => void;
    onRightJsonParse: (data: unknown) => void;
    onCloseLeft: () => void;
    onCloseRight: () => void;
}

const SplitCodeView: React.FC<SplitCodeViewProps> = ({
    leftFile,
    rightFile,
    activePane,
    onActivePaneChange,
    onLeftContentChange,
    onRightContentChange,
    onLeftJsonParse,
    onRightJsonParse,
    onCloseLeft,
    onCloseRight,
}) => {
    const [splitRatio, setSplitRatio] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const isSplit = !!leftFile && !!rightFile;

    // Resizer drag logic
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setSplitRatio(Math.max(0.2, Math.min(0.8, ratio)));
        };

        const handleMouseUp = () => setIsDragging(false);

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

    if (!leftFile && !rightFile) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h5>Code Editör</h5>
                <p className="text-muted">Sol panelden bir dosya seçerek düzenlemeye başlayın</p>
            </div>
        );
    }

    return (
        <div className="split-code-view" ref={containerRef}>
            {/* Left Pane */}
            {leftFile && (
                <div
                    className={`split-code-pane ${activePane === 'left' ? 'active' : ''}`}
                    style={{ width: isSplit ? `calc(${splitRatio * 100}% - 3px)` : '100%' }}
                    onMouseDown={() => onActivePaneChange('left')}
                >
                    <CodeView
                        file={leftFile}
                        onContentChange={onLeftContentChange}
                        onJsonParse={onLeftJsonParse}
                        onClose={isSplit ? onCloseLeft : undefined}
                    />
                </div>
            )}

            {/* Resizer */}
            {isSplit && (
                <div
                    className={`split-code-resizer ${isDragging ? 'dragging' : ''}`}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                >
                    <div className="split-code-resizer-grip">
                        <span /><span /><span />
                    </div>
                </div>
            )}

            {/* Right Pane */}
            {rightFile && (
                <div
                    className={`split-code-pane ${activePane === 'right' ? 'active' : ''}`}
                    style={{ width: isSplit ? `calc(${(1 - splitRatio) * 100}% - 3px)` : '100%' }}
                    onMouseDown={() => onActivePaneChange('right')}
                >
                    <CodeView
                        file={rightFile}
                        onContentChange={onRightContentChange}
                        onJsonParse={onRightJsonParse}
                        onClose={onCloseRight}
                    />
                </div>
            )}
        </div>
    );
};

export default SplitCodeView;
