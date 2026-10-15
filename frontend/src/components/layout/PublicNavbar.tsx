import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import type { UserRole } from '../../types';

export const PublicNavbar: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return '/admin';
      case 'API_PROVIDER': return '/provider';
      case 'USER': return '/dashboard';
    }
  };

  const getDashboardLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return t('Admin Console') || 'Console Admin';
      case 'API_PROVIDER': return t('Provider Suite') || 'Provider Hub';
      case 'USER': return t('My Dashboard') || 'Bảng điều khiển';
    }
  };

  const mainLinks = [
    { label: t('Explore APIs') || 'Khám phá API', path: '/marketplace' },
    { label: t('Compare') || 'So sánh', path: '/compare' },
    { label: t('Pricing Plans') || 'Bảng giá', path: '/pricing' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link to="/marketplace" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </div>
          <div className="flex flex-col">
            <span className="text-headline-sm font-headline-sm font-bold text-primary tracking-tight leading-none whitespace-nowrap">API HUB</span>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-on-surface-variant/70 whitespace-nowrap">{t('Marketplace')}</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 xl:gap-8 flex-1 ml-4 lg:ml-8">
          {mainLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-body-md font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Language Switcher, Role Switcher & Workspace Link */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher variant="dropdown" />

          {/* Workspace Button or Sign In (hidden on smallest screens) */}
          {isAuthenticated ? (
            <Link
              to={getDashboardPath(currentUser.role)}
              className="hidden sm:flex h-9 px-3.5 bg-primary text-on-primary rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-all items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-[0.98] whitespace-nowrap flex-shrink-0"
            >
              <span>{getDashboardLabel(currentUser.role)}</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex h-9 px-3.5 bg-primary text-on-primary rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-all items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-[0.98] whitespace-nowrap flex-shrink-0"
            >
              <span>{t('Sign in') || 'Đăng nhập'}</span>
              <span className="material-symbols-outlined text-[17px]">login</span>
            </Link>
          )}

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            aria-label={t('Toggle menu')}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-xl text-on-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-surface/95 backdrop-blur-xl px-4 py-3">
          <nav className="flex flex-col gap-1">
            {mainLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-2 py-2.5 rounded-lg text-body-md font-medium transition-colors ${
                    isActive
                      ? 'text-primary font-semibold bg-primary/5'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <Link
                to={getDashboardPath(currentUser.role)}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 px-2 py-2.5 rounded-lg text-body-md font-semibold text-primary bg-primary/5 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                {getDashboardLabel(currentUser.role)}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 px-2 py-2.5 rounded-lg text-body-md font-semibold text-primary bg-primary/5 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                {t('Sign in') || 'Đăng nhập'}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
