import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import type { UserRole } from '../../types';

export const PublicNavbar: React.FC = () => {
  const { currentUser } = useAuth();
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
            <span className="text-[10px] uppercase font-semibold tracking-widest text-on-surface-variant whitespace-nowrap">{t('Marketplace')}</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 flex-1 ml-4 lg:ml-8">
          {mainLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-1.5 rounded-lg text-body-md font-medium whitespace-nowrap transition-colors select-none ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-primary/10 rounded-lg -z-10 border border-primary/20"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Desktop */}
        <div className="hidden md:flex items-center gap-2.5 md:gap-3 flex-shrink-0">
          <LanguageSwitcher variant="dropdown" />

          {currentUser ? (
            <Link
              to={getDashboardPath(currentUser.role)}
              className="h-9 px-3.5 bg-primary text-on-primary rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-[0.98] whitespace-nowrap flex-shrink-0"
            >
              <span>{getDashboardLabel(currentUser.role)}</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="h-9 px-3.5 rounded-xl border border-outline-variant/50 text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-all flex items-center justify-center"
              >
                {t('Sign In') || 'Đăng nhập'}
              </Link>
              <Link
                to="/register"
                className="h-9 px-3.5 bg-primary text-on-primary rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-all flex items-center justify-center shadow-2xs"
              >
                {t('Register') || 'Đăng ký'}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher variant="dropdown" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="w-9 h-9 rounded-xl border border-outline-variant/40 bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden border-t border-outline-variant/20 bg-surface/98 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fade-in shadow-lg">
          <nav className="flex flex-col space-y-2">
            {mainLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-body-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-2.5">
            {currentUser ? (
              <>
                <div className="flex items-center justify-between px-1">
                  <span className="text-body-xs text-on-surface-variant font-code-sm">{currentUser.email}</span>
                  <span className="text-body-xs text-primary font-semibold font-code-sm">{currentUser.role}</span>
                </div>
                <Link
                  to={getDashboardPath(currentUser.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-10 bg-primary text-on-primary rounded-xl text-body-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>{getDashboardLabel(currentUser.role)}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-10 rounded-xl border border-outline-variant text-body-sm font-semibold text-on-surface flex items-center justify-center hover:bg-surface-container"
                >
                  {t('Sign In') || 'Đăng nhập'}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-10 bg-primary text-on-primary rounded-xl text-body-sm font-semibold flex items-center justify-center shadow-sm"
                >
                  {t('Register') || 'Đăng ký'}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
