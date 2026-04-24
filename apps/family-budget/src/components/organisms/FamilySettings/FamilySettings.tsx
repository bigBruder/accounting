import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import styles from './FamilySettings.module.css';

interface FamilySettingsProps {
  onClose: () => void;
}

export const FamilySettings: React.FC<FamilySettingsProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { familyId, joinFamily } = useAuth();
  const { fixExistingTransfers } = useData();
  const [newId, setNewId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [fixResult, setFixResult] = useState<number | null>(null);

  const handleFixTransfers = async () => {
    setFixLoading(true);
    setFixResult(null);
    try {
      const count = await fixExistingTransfers();
      setFixResult(count);
    } catch (err) {
      console.error(err);
      alert(t('settings.fixError'));
    } finally {
      setFixLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim()) return;
    
    if (window.confirm(t('settings.joinConfirm'))) {
      setLoading(true);
      try {
        await joinFamily(newId.trim());
        setNewId('');
        onClose();
        alert(t('settings.joinSuccess'));
      } catch (err) {
        console.error(err);
        alert(t('settings.joinError'));
      } finally {
        setLoading(false);
      }
    }
  };

  const copyToClipboard = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.card} ${styles.animateScaleIn}`} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>{t('settings.familyTitle')}</h3>
          <button className={styles.btnClose} onClick={onClose} aria-label="Close">&times;</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {t('settings.familyId')}
            </label>
            <div className={styles.idDisplay}>
              <code>{familyId}</code>
              <button onClick={copyToClipboard} className={styles.btnCopy}>
                {copySuccess ? '✓' : '❐'}
              </button>
            </div>
            <p className={styles.hint}>{t('settings.familyIdHint')}</p>
          </div>

          <hr className={styles.divider} />

          <form onSubmit={handleJoin} className={styles.joinForm}>
            <label className={styles.label}>
              {t('settings.joinFamily')}
            </label>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                placeholder={t('settings.enterCode')} 
                value={newId}
                onChange={e => setNewId(e.target.value)}
                disabled={loading}
                className={styles.modalInput}
              />
              <button type="submit" className={styles.btnJoin} disabled={loading || !newId}>
                {t('settings.join')}
              </button>
            </div>
          </form>

          <hr className={styles.divider} />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {t('settings.fixTransfers')}
            </label>
            <p className={styles.hint} style={{ marginTop: 0, marginBottom: '12px' }}>
              {t('settings.fixTransfersHint')}
            </p>
            <button
              type="button"
              className={styles.btnJoin}
              disabled={fixLoading}
              onClick={handleFixTransfers}
            >
              {fixLoading ? t('settings.fixing') : t('settings.fixTransfersBtn')}
            </button>
            {fixResult !== null && (
              <p className={styles.hint} style={{ color: fixResult > 0 ? '#38a169' : '#718096', marginTop: '8px' }}>
                {fixResult > 0
                  ? t('settings.fixedCount', { count: fixResult, pairs: fixResult / 2 })
                  : t('settings.noFixedFound')}
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
