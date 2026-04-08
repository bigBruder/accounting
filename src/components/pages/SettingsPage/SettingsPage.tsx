import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';

const CAT_AVATARS = [
  '🐈‍⬛', '🐈', '🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
  '🐾', '🦁', '🐯', '🐆', '🐅', '🦊', '🐺', '🐻', '🐼', '🐨', '🦝', '🦄',
];

const CURRENCIES = [
  { code: 'UAH', symbol: '₴', name: 'Гривня' },
  { code: 'USD', symbol: '$', name: 'Долар' },
  { code: 'EUR', symbol: '€', name: 'Євро' },
  { code: 'PLN', symbol: 'zł', name: 'Злотий' },
];

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, familyId, monobankToken, profile, joinFamily, updateProfile, updateMonobankToken } = useAuth();
  const { fixExistingTransfers } = useData();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji);
  const [currency, setCurrency] = useState(profile.currency);
  const [monthlyBudget, setMonthlyBudget] = useState(profile.monthlyBudget);
  const [newFamilyId, setNewFamilyId] = useState('');
  const [newToken, setNewToken] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [fixResult, setFixResult] = useState<number | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [tokenSaving, setTokenSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ displayName, avatarEmoji, currency, monthlyBudget });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!newFamilyId.trim()) return;
    if (!window.confirm('Ви впевнені? Ваші активні дані зміняться на дані нової сім\'ї.')) return;
    setJoinLoading(true);
    try {
      await joinFamily(newFamilyId.trim());
      setNewFamilyId('');
      alert('Успішно приєднано до нової сім\'ї!');
    } catch (err) {
      alert('Помилка при приєднанні.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleSaveToken = async () => {
    if (!newToken.trim()) return;
    setTokenSaving(true);
    try {
      await updateMonobankToken(newToken.trim());
      setNewToken('');
      alert('Токен збережено!');
    } catch (err) {
      alert('Помилка збереження токена.');
    } finally {
      setTokenSaving(false);
    }
  };

  const handleFixTransfers = async () => {
    setFixLoading(true);
    setFixResult(null);
    try {
      const count = await fixExistingTransfers();
      setFixResult(count);
    } catch (err) {
      alert('Помилка при виправленні переказів.');
    } finally {
      setFixLoading(false);
    }
  };

  const copyFamilyId = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ {t('common.settings', { defaultValue: 'Налаштування' })}</h1>
        <p className="page-subtitle">Керуйте своїм профілем та загальними параметрами</p>
      </div>

      <div className="settings-grid">
        {/* Profile Section */}
        <div className="settings-card">
          <div className="settings-card__header">
            <span className="settings-card__icon">👤</span>
            <h2 className="settings-card__title">Профіль</h2>
          </div>
          <div className="settings-card__body">
            {/* Avatar Picker */}
            <div className="settings-field">
              <label className="settings-label">Аватар</label>
              <div className="avatar-preview">
                <span className="avatar-preview__emoji">{avatarEmoji}</span>
                <span className="avatar-preview__name">{displayName || user?.email || 'Користувач'}</span>
              </div>
              <div className="avatar-grid">
                {CAT_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    className={`avatar-grid__item ${avatarEmoji === emoji ? 'avatar-grid__item--active' : ''}`}
                    onClick={() => setAvatarEmoji(emoji)}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div className="settings-field">
              <label className="settings-label">Ім'я</label>
              <input
                type="text"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Як вас звати?"
              />
            </div>

            {/* Email (read-only) */}
            <div className="settings-field">
              <label className="settings-label">Email</label>
              <input
                type="text"
                className="input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            {/* Monobank Name */}
            {profile.monoClientName && (
              <div className="settings-field">
                <label className="settings-label">Ім'я в Monobank</label>
                <div className="settings-mono-name">
                  🐈‍⬛ {profile.monoClientName}
                </div>
              </div>
            )}

            <button
              className="btn btn--primary settings-save-btn"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? 'Зберігаю...' : saved ? '✅ Збережено!' : 'Зберегти профіль'}
            </button>
          </div>
        </div>

        {/* Family Section */}
        <div className="settings-card">
          <div className="settings-card__header">
            <span className="settings-card__icon">👨‍👩‍👧‍👦</span>
            <h2 className="settings-card__title">Сім'я</h2>
          </div>
          <div className="settings-card__body">
            <div className="settings-field">
              <label className="settings-label">Код вашої сім'ї</label>
              <div className="settings-copy-field">
                <code className="settings-copy-field__code">{familyId}</code>
                <button className="settings-copy-field__btn" onClick={copyFamilyId}>
                  {copySuccess ? '✅' : '📋'}
                </button>
              </div>
              <span className="settings-hint">Передайте цей код іншому члену сім'ї для об'єднання бюджету</span>
            </div>

            <div className="settings-field">
              <label className="settings-label">Приєднатися до іншої сім'ї</label>
              <div className="settings-inline-action">
                <input
                  type="text"
                  className="input"
                  placeholder="Введіть код сім'ї..."
                  value={newFamilyId}
                  onChange={(e) => setNewFamilyId(e.target.value)}
                  disabled={joinLoading}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleJoinFamily}
                  disabled={joinLoading || !newFamilyId}
                >
                  {joinLoading ? '...' : 'Приєднатися'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Monobank Section */}
        <div className="settings-card">
          <div className="settings-card__header">
            <span className="settings-card__icon">🏦</span>
            <h2 className="settings-card__title">Monobank</h2>
          </div>
          <div className="settings-card__body">
            <div className="settings-field">
              <label className="settings-label">Статус підключення</label>
              <div className={`settings-status ${monobankToken ? 'settings-status--connected' : 'settings-status--disconnected'}`}>
                <span className="settings-status__dot"></span>
                {monobankToken ? 'Підключено' : 'Не підключено'}
              </div>
            </div>

            <div className="settings-field">
              <label className="settings-label">
                {monobankToken ? 'Змінити токен' : 'Підключити токен'}
              </label>
              <div className="settings-inline-action">
                <input
                  type="password"
                  className="input"
                  placeholder="Вставте токен з api.monobank.ua"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  disabled={tokenSaving}
                />
                <button
                  className="btn btn--primary"
                  onClick={handleSaveToken}
                  disabled={tokenSaving || !newToken}
                >
                  {tokenSaving ? '...' : 'Зберегти'}
                </button>
              </div>
              <span className="settings-hint">
                Отримайте токен на <a href="https://api.monobank.ua/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>api.monobank.ua</a>
              </span>
            </div>

            <div className="settings-field">
              <label className="settings-label">🔄 Виправити перекази</label>
              <span className="settings-hint" style={{ marginBottom: '8px', display: 'block' }}>
                Знайти старі транзакції, які є переказами між членами сім'ї, та виправити їх
              </span>
              <button
                className="btn btn--secondary"
                onClick={handleFixTransfers}
                disabled={fixLoading}
              >
                {fixLoading ? 'Виправляю...' : 'Знайти та виправити'}
              </button>
              {fixResult !== null && (
                <span className="settings-hint" style={{ color: fixResult > 0 ? 'var(--color-income)' : 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                  {fixResult > 0
                    ? `✅ Виправлено ${fixResult} транзакцій (${fixResult / 2} переказів).`
                    : '✅ Все в порядку — нових переказів не знайдено!'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Budget Section */}
        <div className="settings-card">
          <div className="settings-card__header">
            <span className="settings-card__icon">💰</span>
            <h2 className="settings-card__title">Бюджет</h2>
          </div>
          <div className="settings-card__body">
            <div className="settings-field">
              <label className="settings-label">Місячний ліміт</label>
              <input
                type="number"
                className="input"
                value={monthlyBudget || ''}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
              <span className="settings-hint">Встановіть бажаний максимум витрат на місяць</span>
            </div>

            <div className="settings-field">
              <label className="settings-label">Валюта</label>
              <div className="currency-grid">
                {CURRENCIES.map((cur) => (
                  <button
                    key={cur.code}
                    className={`currency-grid__item ${currency === cur.code ? 'currency-grid__item--active' : ''}`}
                    onClick={() => setCurrency(cur.code)}
                    type="button"
                  >
                    <span className="currency-grid__symbol">{cur.symbol}</span>
                    <span className="currency-grid__name">{cur.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn--primary settings-save-btn"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? 'Зберігаю...' : saved ? '✅ Збережено!' : 'Зберегти налаштування'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
