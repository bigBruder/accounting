import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import styles from './MonoConnectModal.module.css';

interface MonoConnectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const MonoConnectModal: React.FC<MonoConnectModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { monobankToken, updateMonobankToken } = useAuth();
  const { syncMonobank } = useData();
  const [token, setToken] = useState(monobankToken || '');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) return;
    
    setLoading(true);
    try {
      await updateMonobankToken(cleanToken);
      // Auto-sync after successful connection with direct token for speed
      await syncMonobank(cleanToken);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || t('mono.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.card} ${styles.animateScaleIn}`} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.logo}>🏦</div>
          <h2 className={styles.headerTitle}>{t('mono.title')}</h2>
          <p className={styles.headerSubtitle}>{t('mono.subtitle')}</p>
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>{t('mono.step1')}</h4>
              <p>{t('mono.step1Desc')}</p>
              <a 
                href="https://api.monobank.ua/" 
                target="_blank" 
                rel="noreferrer" 
                className={styles.btnOutline}
              >
                {t('mono.getToken')}
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>{t('mono.step2')}</h4>
              <p>{t('mono.step2Desc')}</p>
              <input 
                type="password" 
                className={styles.input} 
                placeholder={t('mono.tokenPlaceholder')} 
                value={token}
                onChange={e => setToken(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>{t('mono.step3')}</h4>
              <p>{t('mono.step3Desc')}</p>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
          <button 
            className={styles.btnPrimary} 
            onClick={handleConnect} 
            disabled={loading || !token.trim()}
          >
            {loading ? t('mono.connecting') : t('mono.connectBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
