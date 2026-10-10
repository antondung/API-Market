import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import type { UserRole } from '../../types';

interface RoleOption {
  role: UserRole;
  labelEn: string;
  labelVi: string;
  badgeEn: string;
  badgeVi: string;
  descEn: string;
  descVi: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'USER',
    labelEn: 'API Consumer',
    labelVi: 'Người dùng API',
    badgeEn: 'Consumer',
    badgeVi: 'Người dùng API',
    descEn: 'Explore & subscribe APIs, sandbox & keys',
    descVi: 'Khám phá, đăng ký API, sandbox & API key',
    icon: 'person',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/20'
  },
  {
    role: 'API_PROVIDER',
    labelEn: 'API Provider',
    labelVi: 'Nhà cung cấp API',
    badgeEn: 'Provider',
    badgeVi: 'Nhà cung cấp',
    descEn: 'Publish APIs, OpenAPI imports & revenue',
    descVi: 'Đăng tải API, nhập OpenAPI & doanh thu',
    icon: 'corporate_fare',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/20'
  },
  {
    role: 'ADMIN',
    labelEn: 'System Admin',
    labelVi: 'Quản trị viên',
    badgeEn: 'Admin',
    badgeVi: 'Quản trị viên',
    descEn: 'Platform governance, reviews & audit logs',
    descVi: 'Quản trị hệ thống, duyệt API & kiểm toán',
    icon: 'shield_person',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20'
  }
];

interface RoleSwitcherProps {
  className?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ className = '' }) => {
  const { currentUser, switchRole } = useAuth();
  const currentRole = currentUser?.role ?? 'USER';
  const { language } = useLanguage();
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

  const currentOption = ROLE_OPTIONS.find(o => o.role === currentRole) || ROLE_OPTIONS[0];

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={containerRef}
      data-no-translate="true"
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex items-center gap-2 h-9 px-3 rounded-xl border text-[13px] font-medium transition-all shadow-2xs select-none ${
          isOpen
            ? 'bg-surface-container-high border-primary/50 ring-2 ring-primary/10 shadow-sm'
            : 'bg-surface-container/60 hover:bg-surface-container border-outline-variant/40 hover:border-outline-variant text-on-surface'
        }`}
      >
        <span className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${currentOption.bgClass} ${currentOption.colorClass}`}>
          <span className="material-symbols-outlined text-[15px]">{currentOption.icon}</span>
        </span>

        <span className="font-semibold text-on-surface whitespace-nowrap">
          {language === 'vi' ? currentOption.labelVi : currentOption.labelEn}
        </span>

        <span className={`material-symbols-outlined text-[16px] text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-on-surface'}`}>
          expand_more
        </span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-76 sm:w-80 rounded-2xl bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 shadow-xl py-2 z-50 animate-scale-up origin-top-right">
          {/* Header */}
          <div className="px-3.5 py-1.5 border-b border-outline-variant/20 flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              {language === 'vi' ? 'Chuyển đổi vai trò' : 'Switch Active Persona'}
            </span>
            <span className="text-[10px] font-code-sm text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
              RBAC
            </span>
          </div>

          {/* Options */}
          <div className="p-1 space-y-1" role="listbox">
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = opt.role === currentRole;
              return (
                <button
                  key={opt.role}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    switchRole(opt.role);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/20 text-on-surface shadow-2xs'
                      : 'hover:bg-surface-container-highest/80 text-on-surface border border-transparent'
                  }`}
                >
                  {/* Icon Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${opt.bgClass} ${opt.colorClass} border ${opt.borderClass}`}>
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[13px] font-bold truncate ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        {language === 'vi' ? opt.labelVi : opt.labelEn}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${opt.bgClass} ${opt.colorClass}`}>
                        {language === 'vi' ? opt.badgeVi : opt.badgeEn}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5 leading-snug">
                      {language === 'vi' ? opt.descVi : opt.descEn}
                    </p>
                  </div>

                  {/* Active Checkmark */}
                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-1">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-3.5 pt-2 mt-1 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant/80">
            <span>{language === 'vi' ? 'Tự động đồng bộ quyền hạn' : 'Instant permission switch'}</span>
            <span className="material-symbols-outlined text-[14px]">lock_open</span>
          </div>
        </div>
      )}
    </div>
  );
};
