import React, { useState, useRef, useEffect } from 'react';

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: string;
  badge?: string;
  description?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  icon?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Select option...',
  size = 'md',
  className = '',
  dropdownClassName = '',
  disabled = false,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const sizeClasses = size === 'sm' ? 'h-8 px-2.5 text-[12px]' : 'h-9 px-3 text-[13px]';

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={containerRef}
      data-no-translate="true"
    >
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex items-center justify-between gap-2 rounded-xl border font-medium transition-all shadow-2xs select-none w-full ${sizeClasses} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-surface-container' :
          isOpen
            ? 'bg-surface-container-high border-primary/50 ring-2 ring-primary/10 shadow-sm'
            : 'bg-surface-container/60 hover:bg-surface-container border-outline-variant/40 hover:border-outline-variant text-on-surface'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && (
            <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">
              {icon}
            </span>
          )}
          {selectedOption?.icon && !icon && (
            <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <span className="font-semibold text-on-surface truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <span
          className={`material-symbols-outlined text-[16px] text-on-surface-variant transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-primary' : 'group-hover:text-on-surface'
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 min-w-[200px] w-full max-h-64 overflow-y-auto rounded-2xl bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 shadow-xl p-1.5 z-50 animate-scale-up origin-top ${dropdownClassName}`}
          role="listbox"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-body-sm transition-all ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface hover:bg-surface-container-highest/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && (
                    <span className="material-symbols-outlined text-[17px] text-primary flex-shrink-0">
                      {opt.icon}
                    </span>
                  )}
                  <div className="truncate">
                    <span className="block truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="block text-[11px] text-on-surface-variant font-normal truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {opt.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      check
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
