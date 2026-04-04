import React, { useState } from 'react';
import { LanguageSwitcher } from '../molecules/LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import { FamilySettings } from './FamilySettings';

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <button
            onClick={() => setIsFamilyOpen(true)}
            className="btn btn--secondary"
            style={{ fontSize: '0.875rem', padding: '0.4rem 1rem' }}
          >
            👨‍👩‍👧‍👦 Сім'я
          </button>
        </div>
        <div className="header__right">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <LanguageSwitcher />
            <button
              onClick={logout}
              className="btn"
              style={{ fontSize: '0.875rem', padding: '0.4rem 1rem', color: 'white', background: 'rgba(255,255,255,0.05)' }}
            >
              Вийти
            </button>
          </div>
        </div>
      </div>
      {isFamilyOpen && <FamilySettings onClose={() => setIsFamilyOpen(false)} />}
    </header>
  );
};
