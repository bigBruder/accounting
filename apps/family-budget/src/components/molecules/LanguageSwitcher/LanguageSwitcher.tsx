import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'uk' ? 'en' : 'uk';
    i18n.changeLanguage(nextLang);
  };

  const currentLang = i18n.language.toUpperCase();

  return (
    <div className="language-switcher">
      <button 
        onClick={toggleLanguage} 
        className="language-switcher__button"
        aria-label="Toggle language"
      >
        <span className="language-switcher__label">
          {currentLang === 'UK' ? '🇺🇦 UA' : '🇺🇸 EN'}
        </span>
        <span className="language-switcher__icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </span>
      </button>
    </div>
  );
};
