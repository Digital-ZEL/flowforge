'use client';

import React, { useState, useCallback } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  sections: NavSection[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  userAvatar?: React.ReactNode;
  userName?: string;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  sections,
  activeId,
  onNavigate,
  collapsed: controlledCollapsed,
  onToggleCollapse,
  userAvatar,
  userName,
  className = '',
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  const toggleCollapse = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((p) => !p);
    }
  }, [onToggleCollapse]);

  return (
    <nav
      className={[
        'flex flex-col h-full',
        'bg-[var(--v2-bg-subtle)] border-r border-[var(--v2-border-subtle)]',
        'transition-[width] duration-[var(--v2-duration-slow)] ease-[var(--v2-ease-default)]',
        collapsed ? 'w-[var(--v2-sidebar-collapsed)]' : 'w-[var(--v2-sidebar-width)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Main navigation"
    >
      {/* Collapse toggle */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-[var(--v2-space-4)] h-14 border-b border-[var(--v2-border-subtle)]`}>
        {!collapsed && (
          <span className="text-[var(--v2-text-base)] font-semibold text-[var(--v2-text)] tracking-[var(--v2-tracking-tight)]">
            FlowForge
          </span>
        )}
        <button
          onClick={toggleCollapse}
          className="w-7 h-7 flex items-center justify-center rounded-[var(--v2-radius-sm)] text-[var(--v2-text-muted)] hover:text-[var(--v2-text-secondary)] hover:bg-[var(--v2-bg-muted)] transition-colors duration-[var(--v2-duration-fast)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            {collapsed ? (
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto py-[var(--v2-space-3)] px-[var(--v2-space-2)]">
        {sections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-[var(--v2-space-6)]' : ''}>
            {section.title && !collapsed && (
              <p className="px-[var(--v2-space-3)] mb-[var(--v2-space-2)] text-[10px] font-semibold uppercase tracking-[var(--v2-tracking-wider)] text-[var(--v2-text-muted)]">
                {section.title}
              </p>
            )}
            <ul role="list" className="space-y-[var(--v2-space-0-5)]">
              {section.items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        item.onClick?.();
                        onNavigate?.(item.id);
                      }}
                      className={[
                        'w-full flex items-center gap-[var(--v2-space-3)]',
                        collapsed ? 'justify-center px-0 py-2' : 'px-[var(--v2-space-3)] py-[var(--v2-space-2)]',
                        'rounded-[var(--v2-radius-md)] text-[var(--v2-text-sm)] font-medium',
                        'transition-all duration-[var(--v2-duration-fast)] ease-[var(--v2-ease-default)]',
                        'outline-none focus-visible:ring-2 focus-visible:ring-[var(--v2-accent)]',
                        isActive
                          ? 'bg-[var(--v2-accent-subtle)] text-[var(--v2-accent-text)]'
                          : 'text-[var(--v2-text-secondary)] hover:text-[var(--v2-text)] hover:bg-[var(--v2-bg-muted)]',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-current={isActive ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="shrink-0 w-5 h-5 flex items-center justify-center [&>svg]:w-[18px] [&>svg]:h-[18px]" aria-hidden="true">
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-semibold bg-[var(--v2-bg-muted)] text-[var(--v2-text-muted)]">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User section at bottom */}
      <div className={`border-t border-[var(--v2-border-subtle)] p-[var(--v2-space-3)] ${collapsed ? 'flex justify-center' : ''}`}>
        <div
          className={[
            'flex items-center gap-[var(--v2-space-3)]',
            collapsed ? 'justify-center' : 'px-[var(--v2-space-2)]',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {userAvatar || (
            <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--v2-bg-muted)] border border-[var(--v2-border-subtle)] flex items-center justify-center text-[var(--v2-text-muted)] text-[var(--v2-text-xs)] font-medium">
              {userName ? userName.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          {!collapsed && userName && (
            <span className="text-[var(--v2-text-sm)] font-medium text-[var(--v2-text-secondary)] truncate">
              {userName}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

Sidebar.displayName = 'Sidebar';

export { Sidebar };
export type { SidebarProps, NavSection, NavItem };
