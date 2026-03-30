import React from 'react';
import { LanguageSwitcher } from '../molecules/LanguageSwitcher';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left"></div>
        <div className="header__right">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
