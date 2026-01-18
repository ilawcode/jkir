'use client';

import React from 'react';

export type TabType = 'code' | 'tree' | 'flow' | 'query';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
    const tabs: { id: TabType; icon: string; label: string }[] = [
        { id: 'code', icon: '</>', label: 'Code' },
        { id: 'tree', icon: '🌳', label: 'Tree' },
        { id: 'flow', icon: '⚡', label: 'Flow' },
        { id: 'query', icon: '🔍', label: 'Query' },
    ];

    return (
        <div className="tab-navigation">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;
