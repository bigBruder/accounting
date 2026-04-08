import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './LoginPage.module.css';
import mathMeme from '../../../assets/math-meme.png';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, logout, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginSplit}>
        <div className={`${styles.loginLeft} ${styles.animateFadeIn}`}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <div className={styles.loginLogo}>💰</div>
              <h1 className={styles.loginTitle}>
                {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
              </h1>
              <p className={styles.loginSubtitle}>
                {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('auth.email')}</label>
                <input 
                  type="email" 
                  className={styles.formInput} 
                  placeholder="name@example.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('auth.password')}</label>
                <input 
                  type="password" 
                  className={styles.formInput} 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <button type="submit" className={styles.btnLogin}>
                {isLogin ? t('auth.loginBtn') : t('auth.registerBtn')}
              </button>
            </form>

            <div className={styles.loginFooter}>
              <button 
                className={styles.btnToggle}
                onClick={() => setIsLogin(!isLogin)} 
              >
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
              </button>
            </div>
            
            {user && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button onClick={logout} className={styles.btnLogout}>
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.loginRight} style={{ backgroundImage: `url(${mathMeme})` }}>
          <div className={styles.overlayGradient}></div>
        </div>
      </div>
    </div>
  );
};
