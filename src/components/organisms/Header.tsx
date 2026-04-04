import React from 'react';
import { LanguageSwitcher } from '../molecules/LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { logout } = useAuth();

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left"></div>
        <div className="header__right" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={logout} className="btn" style={{ fontSize: '0.875rem', padding: '0.25rem 0.6rem' }}>
            Logout
          </button>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
