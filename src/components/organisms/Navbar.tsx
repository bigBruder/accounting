import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../atoms/Icon';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('common.dashboard'), icon: 'dashboard' },
    { to: '/transactions', label: t('common.transactions'), icon: 'transactions' },
    { to: '/categories', label: t('common.categories'), icon: 'categories' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <div className="navbar__logo-icon">💸</div>
        <span className="navbar__logo-text">{t('common.budget')}</span>
      </div>
      <div className="navbar__menu">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            <span className="navbar__link-icon">
              <Icon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
