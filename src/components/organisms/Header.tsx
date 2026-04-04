import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile.displayName || profile.monoClientName || user?.email?.split('@')[0] || 'User';

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
        </div>
        <div className="header__right" ref={dropdownRef}>
          <button
            className="profile-pill"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="profile-pill__avatar">{profile.avatarEmoji}</span>
            <span className="profile-pill__name">{displayName}</span>
            <span className={`profile-pill__caret ${isDropdownOpen ? 'profile-pill__caret--open' : ''}`}>▾</span>
          </button>
          {isDropdownOpen && (
            <div className="profile-dropdown animate-fade-in">
              <div className="profile-dropdown__header">
                <span className="profile-dropdown__avatar">{profile.avatarEmoji}</span>
                <div>
                  <div className="profile-dropdown__name">{displayName}</div>
                  <div className="profile-dropdown__email">{user?.email}</div>
                </div>
              </div>
              <div className="profile-dropdown__divider"></div>
              <button className="profile-dropdown__item" onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}>
                ⚙️ Налаштування
              </button>
              <div className="profile-dropdown__divider"></div>
              <button className="profile-dropdown__item profile-dropdown__item--danger" onClick={logout}>
                🚪 Вийти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
