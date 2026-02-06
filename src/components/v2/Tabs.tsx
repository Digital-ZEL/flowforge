'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tabId: string;
  activeTab: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActive,
  defaultTab,
  onTabChange,
  className = '',
}) => {
  const [internalActive, setInternalActive] = useState(defaultTab || tabs[0]?.id || '');
  const activeTab = controlledActive ?? internalActive;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const idPrefix = useId();

  const updateIndicator = useCallback(() => {
    if (!tabsRef.current) return;
    const activeEl = tabsRef.current.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeTab}"]`
    );
    if (activeEl) {
      const container = tabsRef.current.getBoundingClientRect();
      const tab = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tab.left - container.left,
        width: tab.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleTabChange = (tabId: string) => {
    if (controlledActive === undefined) {
      setInternalActive(tabId);
    }
    onTabChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % enabledTabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = enabledTabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      handleTabChange(enabledTabs[nextIndex].id);
      const btn = tabsRef.current?.querySelector<HTMLButtonElement>(
        `[data-tab-id="${enabledTabs[nextIndex].id}"]`
      );
      btn?.focus();
    }
  };

  return (
    <div
      ref={tabsRef}
      className={`relative flex items-center border-b border-[var(--v2-border-subtle)] ${className}`}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            aria-disabled={tab.disabled}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.id)}
            className={[
              'relative px-[var(--v2-space-4)] py-[var(--v2-space-3)]',
              'text-[var(--v2-text-sm)] font-medium whitespace-nowrap',
              'transition-colors duration-[var(--v2-duration-normal)] ease-[var(--v2-ease-default)]',
              'outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)] focus-visible:ring-offset-0 rounded-t-[var(--v2-radius-sm)]',
              isActive
                ? 'text-[var(--v2-text)]'
                : 'text-[var(--v2-text-muted)] hover:text-[var(--v2-text-secondary)]',
              tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
      {/* Animated indicator bar */}
      <div
        className="absolute bottom-0 h-0.5 bg-[var(--v2-accent)] transition-all duration-[var(--v2-duration-slow)] ease-[var(--v2-ease-default)] rounded-full"
        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        aria-hidden="true"
      />
    </div>
  );
};

Tabs.displayName = 'Tabs';

const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  activeTab,
  children,
  className = '',
  ...props
}) => {
  if (tabId !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      tabIndex={0}
      className={`outline-none ${className}`}
      style={{ animation: 'v2-fade-in var(--v2-duration-slow) var(--v2-ease-out)' }}
      {...props}
    >
      {children}
    </div>
  );
};

TabPanel.displayName = 'TabPanel';

export { Tabs, TabPanel };
export type { TabsProps, TabPanelProps, Tab };
