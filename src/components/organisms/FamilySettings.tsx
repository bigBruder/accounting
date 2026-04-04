import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface FamilySettingsProps {
  onClose: () => void;
}

export const FamilySettings: React.FC<FamilySettingsProps> = ({ onClose }) => {
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
      alert('Помилка при виправленні переказів.');
    } finally {
      setFixLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim()) return;
    
    if (window.confirm('Ви впевнені? Ваші активні дані зміняться на дані нової сім\'ї.')) {
      setLoading(true);
      try {
        await joinFamily(newId.trim());
        setNewId('');
        onClose();
        alert('Успішно приєднано до нової сім\'ї!');
      } catch (err) {
        console.error(err);
        alert('Помилка при приєднанні.');
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

  return (
    <div className="family-settings-overlay" onClick={onClose}>
      <div className="family-settings-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="family-settings-header">
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a202c' }}>Налаштування сім'ї</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        
        <div className="family-settings-content">
          <div className="field-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568' }}>
              Ваш код сім'ї (Family ID):
            </label>
            <div className="id-display">
              <code>{familyId}</code>
              <button onClick={copyToClipboard} className="btn-copy">
                {copySuccess ? '✓' : '❐'}
              </button>
            </div>
            <p className="hint">Передайте цей код іншому члену сім'ї, щоб об'єднати бюджет.</p>
          </div>

          <hr style={{ margin: '24px 0', border: '0', borderTop: '1px solid #edf2f7' }} />

          <form onSubmit={handleJoin} className="family-join-form">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568' }}>
              Приєднатися до іншої сім'ї (введіть код):
            </label>
            <div className="input-group" style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Введіть код сім'ї..." 
                value={newId}
                onChange={e => setNewId(e.target.value)}
                disabled={loading}
                className="modal-input"
              />
              <button type="submit" className="btn-join" disabled={loading || !newId}>
                Приєднатися
              </button>
            </div>
          </form>

          <hr style={{ margin: '24px 0', border: '0', borderTop: '1px solid #edf2f7' }} />

          <div className="field-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568' }}>
              🔄 Виправити перекази
            </label>
            <p className="hint" style={{ marginTop: 0, marginBottom: '12px' }}>
              Автоматично знайти старі транзакції, які насправді є переказами між членами сім'ї, та виправити їх.
            </p>
            <button
              type="button"
              className="btn-join"
              disabled={fixLoading}
              onClick={handleFixTransfers}
            >
              {fixLoading ? 'Виправляю...' : 'Знайти та виправити перекази'}
            </button>
            {fixResult !== null && (
              <p className="hint" style={{ color: fixResult > 0 ? '#38a169' : '#718096', marginTop: '8px' }}>
                {fixResult > 0
                  ? `✅ Виправлено ${fixResult} транзакцій (${fixResult / 2} пар переказів).`
                  : '✅ Нових переказів не знайдено — все в порядку!'}
              </p>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Закрити
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .family-settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .family-settings-card {
          background: white;
          padding: 28px;
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .family-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .btn-close {
          background: #f7fafc;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #a0aec0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .btn-close:hover {
          background: #edf2f7;
          color: #4a5568;
        }
        .id-display {
          background: #f8fafc;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .id-display code {
          font-weight: 600;
          color: #2d3748;
          word-break: break-all;
          font-family: 'Courier New', monospace;
        }
        .btn-copy {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.2s;
        }
        .btn-copy:hover {
          border-color: #cbd5e0;
          background: #f7fafc;
        }
        .hint {
          font-size: 0.85rem;
          color: #718096;
          margin-top: 8px;
        }
        .modal-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .modal-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .btn-join {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .btn-join:hover:not(:disabled) {
          background: #5a67d8;
        }
        .btn-join:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-cancel {
          background: white;
          color: #4a5568;
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-cancel:hover {
          background: #f7fafc;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
