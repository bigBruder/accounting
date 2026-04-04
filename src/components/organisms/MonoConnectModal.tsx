import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface MonoConnectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const MonoConnectModal: React.FC<MonoConnectModalProps> = ({ onClose, onSuccess }) => {
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
      alert(err.message || 'Помилка при підключенні Monobank.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mono-wizard-overlay" onClick={onClose}>
      <div className="mono-wizard-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="mono-wizard-header">
          <div className="mono-logo">🏦</div>
          <h2 style={{ margin: '8px 0', fontSize: '1.5rem', fontWeight: 700 }}>Підключення Monobank</h2>
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>Автоматизуйте облік витрат за 3 простих кроки</p>
        </div>

        <div className="mono-steps">
          <div className="mono-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Отримайте токен</h4>
              <p>Перейдіть за посиланням та відскануйте QR-код застосунком Monobank.</p>
              <a 
                href="https://api.monobank.ua/" 
                target="_blank" 
                rel="noreferrer" 
                className="mono-btn-outline"
              >
                Отримати токен ↗
              </a>
            </div>
          </div>

          <div className="mono-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Скопіюйте та вставте сюди</h4>
              <p>Після сканування ви побачите свій Personal Token. Скопіюйте його.</p>
              <input 
                type="password" 
                className="mono-input" 
                placeholder="Вставте ваш токен..." 
                value={token}
                onChange={e => setToken(e.target.value)}
              />
            </div>
          </div>

          <div className="mono-step">
            <div className="step-number">3</div>
            <div className="step-content" style={{ border: 'none', paddingBottom: 0 }}>
              <h4>Збережіть та готово!</h4>
              <p>Ми автоматично завантажимо транзакції за останні 30 днів.</p>
            </div>
          </div>
        </div>

        <div className="mono-wizard-footer">
          <button className="mono-btn-cancel" onClick={onClose} disabled={loading}>Скасувати</button>
          <button 
            className="mono-btn-primary" 
            onClick={handleConnect} 
            disabled={loading || !token.trim()}
          >
            {loading ? '⏳ Підключення...' : 'Підключити та синхронізувати'}
          </button>
        </div>
      </div>

      <style>{`
        .mono-wizard-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .mono-wizard-card {
          background: white;
          width: 100%;
          max-width: 440px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          color: #1a202c;
        }
        .mono-wizard-header {
          padding: 32px 32px 24px;
          text-align: center;
          background: #f7fafc;
        }
        .mono-logo {
          font-size: 3rem;
          line-height: 1;
        }
        .mono-steps {
          padding: 24px 32px;
        }
        .mono-step {
          display: flex;
          gap: 20px;
          margin-bottom: 4px;
        }
        .step-number {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          margin-top: 2px;
          position: relative;
        }
        .mono-step:not(:last-child) .step-number::after {
          content: '';
          position: absolute;
          top: 32px;
          left: 50%;
          width: 2px;
          height: calc(100% + 4px);
          background: #e2e8f0;
          transform: translateX(-50%);
        }
        .step-content {
          flex: 1;
          padding-bottom: 24px;
          border-bottom: 0px solid #e2e8f0;
        }
        .step-content h4 {
          margin: 0 0 4px 0;
          font-weight: 700;
          color: #2d3748;
        }
        .step-content p {
          margin: 0 0 12px 0;
          font-size: 0.85rem;
          color: #718096;
          line-height: 1.4;
        }
        .mono-btn-outline {
          display: inline-block;
          padding: 8px 16px;
          border: 1.5px solid #cbd5e0;
          border-radius: 10px;
          color: #4a5568;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .mono-btn-outline:hover {
          background: #edf2f7;
          border-color: #a0aec0;
        }
        .mono-input {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid #edf2f7;
          border-radius: 12px;
          font-size: 0.9rem;
          background: #f8fafc;
          transition: all 0.2s;
        }
        .mono-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        .mono-wizard-footer {
          padding: 24px 32px 32px;
          display: flex;
          gap: 12px;
        }
        .mono-btn-cancel {
          flex: 1;
          padding: 12px;
          border: none;
          background: #f7fafc;
          color: #718096;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .mono-btn-cancel:hover { background: #edf2f7; }
        .mono-btn-primary {
          flex: 2;
          padding: 12px;
          border: none;
          background: #667eea;
          color: white;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
        }
        .mono-btn-primary:hover:not(:disabled) {
          background: #5a67d8;
          transform: translateY(-1px);
        }
        .mono-btn-primary:active { transform: translateY(0); }
        .mono-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .animate-scale-in {
          animation: monoScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes monoScaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
