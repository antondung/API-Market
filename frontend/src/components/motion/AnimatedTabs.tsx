import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: string;
  count?: number;
}

interface AnimatedTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  layoutId?: string;
}

export function AnimatedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  layoutId = 'active-tab-indicator',
}: AnimatedTabsProps<T>) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/30 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer select-none flex items-center gap-1.5 ${
              isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {isActive && !shouldReduceMotion && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-surface-container-lowest rounded-lg shadow-2xs border border-outline-variant/20"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            {isActive && shouldReduceMotion && (
              <div className="absolute inset-0 bg-surface-container-lowest rounded-lg shadow-2xs border border-outline-variant/20" />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon && (
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              )}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
