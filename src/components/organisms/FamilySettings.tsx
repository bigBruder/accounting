import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface FamilySettingsProps {
  onClose: () => void;
}

export const FamilySettings: React.FC<FamilySettingsProps> = ({ onClose }) => {
  const { familyId, joinFamily } = useAuth();
  const [newId, setNewId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
      <div className="family-settings-card" onClick={e => e.stopPropagation()}>
        <div className="family-settings-header">
          <h3>Налаштування сім'ї</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="family-settings-content">
          <div className="field-group">
            <label>Ваш код сім'ї (Family ID):</label>
            <div className="id-display">
              <code>{familyId}</code>
              <button onClick={copyToClipboard} className="btn btn--small">
                {copySuccess ? 'Скопійовано!' : 'Копіювати'}
              </button>
            </div>
            <p className="hint">Передайте цей код іншому члену сім'ї, щоб об'єднати бюджет.</p>
          </div>

          <hr />

          <form onSubmit={handleJoin} className="family-join-form">
            <label>Приєднатися до іншої сім'ї:</label>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Введіть код сім'ї..." 
                value={newId}
                onChange={e => setNewId(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="btn btn--primary" disabled={loading || !newId}>
                Приєднатися
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        .family-settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .family-settings-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .family-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
        .id-display {
          background: #f4f7f6;
          padding: 10px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .id-display code {
          font-weight: bold;
          color: #2c3e50;
          word-break: break-all;
          margin-right: 10px;
        }
        .hint {
          font-size: 0.8rem;
          color: #7f8c8d;
          margin-top: 5px;
        }
        .field-group {
          margin-bottom: 20px;
        }
        .input-group {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        .input-group input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        hr {
          margin: 20px 0;
          border: 0;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  );
};
