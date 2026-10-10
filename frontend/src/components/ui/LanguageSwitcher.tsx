import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, type Language } from '../../i18n';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown';
  className?: string;
}

const VietnamFlag = () => (
  <svg className="w-4 h-3 rounded-[2px] shadow-2xs overflow-hidden flex-shrink-0 inline-block" viewBox="0 0 30 20">
    <rect width="30" height="20" fill="#da251d" />
    <polygon
      points="15,4 17.06,10.34 23.73,10.34 18.33,14.26 20.4,20.6 15,16.68 9.6,20.6 11.67,14.26 6.27,10.34 12.94,10.34"
      fill="#ff0"
    />
  </svg>
);

const UKFlag = () => (
  <svg className="w-4 h-3 rounded-[2px] shadow-2xs overflow-hidden flex-shrink-0 inline-block" viewBox="0 0 60 30">
    <clipPath id="uk-clip"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
    <clipPath id="uk-diag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
    <g clipPath="url(#uk-clip)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'dropdown', className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'pill') {
    return (
      <div 
        data-no-translate="true"
        className={`inline-flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant/30 text-body-sm font-medium ${className}`}
      >
        <button
          type="button"
          onClick={() => setLanguage('vi')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all ${
            language === 'vi'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          title="Tiếng Việt"
        >
          <VietnamFlag />
          <span>VI</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold transition-all ${
            language === 'en'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          title="English"
        >
          <UKFlag />
          <span>EN</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      data-no-translate="true"
      className={`relative ${className}`} 
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container/60 hover:bg-surface-container text-on-surface text-[13px] font-medium transition-all shadow-2xs hover:border-primary/50"
        title="Chuyển đổi ngôn ngữ / Switch Language"
      >
        {language === 'vi' ? <VietnamFlag /> : <UKFlag />}
        <span className="font-semibold">{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
        <span className={`material-symbols-outlined text-[16px] text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div 
          data-no-translate="true"
          className="absolute right-0 mt-1.5 w-38 rounded-xl bg-surface-container-high border border-outline-variant/30 shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <button
            type="button"
            onClick={() => {
              setLanguage('vi');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] text-left transition-colors ${
              language === 'vi'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <span className="flex items-center gap-2">
              <VietnamFlag />
              <span>Tiếng Việt</span>
            </span>
            {language === 'vi' && (
              <span className="material-symbols-outlined text-primary text-[16px]">check</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-[13px] text-left transition-colors ${
              language === 'en'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <span className="flex items-center gap-2">
              <UKFlag />
              <span>English</span>
            </span>
            {language === 'en' && (
              <span className="material-symbols-outlined text-primary text-[16px]">check</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
