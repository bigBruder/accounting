import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatAmount } from '../../utils/formatters';

interface GoalFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#6366f1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      icon,
      color
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content goal-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Створити нову ціль</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-group">
            <label>Назва цілі</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Наприклад: На відпустку" 
              required 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Цільова сума</label>
              <input 
                type="number" 
                value={targetAmount} 
                onChange={e => setTargetAmount(e.target.value)} 
                placeholder="0.00" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Вже є</label>
              <input 
                type="number" 
                value={currentAmount} 
                onChange={e => setCurrentAmount(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Емоджі</label>
              <input 
                type="text" 
                value={icon} 
                onChange={e => setIcon(e.target.value)} 
                maxLength={2}
              />
            </div>
            <div className="form-group">
              <label>Колір</label>
              <input 
                type="color" 
                value={color} 
                onChange={e => setColor(e.target.value)} 
              />
            </div>
          </div>
          <button type="submit" className="primary-btn full-width">Створити ціль</button>
        </form>
      </div>
    </div>
  );
};

export const GoalsWidget: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateProgress = (goalId: string, current: number, target: number) => {
    const amount = prompt('Введіть суму, яку хочете додати:', '0');
    if (amount) {
      const newAmount = current + parseFloat(amount);
      updateGoal(goalId, { currentAmount: Math.min(newAmount, target) });
    }
  };

  return (
    <div className="goals-section">
      <div className="section-header">
        <div className="title-with-badge">
          <h3 className="section-title">🎯 Спільні цілі</h3>
          <span className="count-badge">{goals.length}</span>
        </div>
        <button className="create-goal-header-btn" onClick={() => setIsModalOpen(true)}>
          <span className="plus-icon">+</span> Створити ціль
        </button>
      </div>

      <div className="goals-grid">
        {goals.length === 0 ? (
          <div className="empty-goals-card">
            <p className="empty-text">Поки що немає спільних цілей. Почніть збирати разом!</p>
            <button className="primary-btn" onClick={() => setIsModalOpen(true)}>Додати першу ціль</button>
          </div>
        ) : (
          goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;
            
            return (
              <div key={goal.id} className={`premium-goal-card ${isCompleted ? 'completed' : ''}`}>
                <div className="goal-card-top">
                  <div className="goal-visual">
                    <div className="goal-icon-bubble" style={{ backgroundColor: `${goal.color}20`, borderColor: goal.color }}>
                      {goal.icon}
                    </div>
                  </div>
                  <div className="goal-main-info">
                    <h4 className="goal-title">{goal.name}</h4>
                    <div className="goal-numbers">
                      <span className="current-num">{formatAmount(goal.currentAmount).replace('₴', '')}</span>
                      <span className="of-separator">з</span>
                      <span className="target-num">{formatAmount(goal.targetAmount)}</span>
                    </div>
                  </div>
                  <div className="goal-quick-actions">
                    <button 
                      className="mini-action-btn add-btn" 
                      onClick={() => handleUpdateProgress(goal.id, goal.currentAmount, goal.targetAmount)}
                      title="Додати внесок"
                    >
                      💰
                    </button>
                    <button 
                      className="mini-action-btn del-btn" 
                      onClick={() => { if(confirm('Видалити ціль?')) deleteGoal(goal.id) }}
                      title="Видалити"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="goal-card-bottom">
                  <div className="premium-progress-wrapper">
                    <div className="progress-meta">
                      <span className="percent-text">{Math.round(progress)}% </span>
                      <span className="status-text">{isCompleted ? 'Виконано! 🎉' : 'У процесі...'}</span>
                    </div>
                    <div className="premium-progress-bar">
                      <div 
                        className="premium-progress-fill" 
                        style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: goal.color }}
                      >
                        <div className="progress-glow" style={{ boxShadow: `0 0 10px ${goal.color}` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <GoalForm 
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => addGoal(data)} 
        />
      )}

      <style>{`
        .goals-section {
          margin: 40px 0;
          width: 100%;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .section-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0;
        }
        
        .count-badge {
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        
        .create-goal-header-btn {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        
        .create-goal-header-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        
        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        
        .premium-goal-card {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        
        .goal-card-top {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          position: relative;
        }
        
        .goal-icon-bubble {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .goal-main-info {
          flex: 1;
        }
        
        .goal-title {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #f1f5f9;
        }
        
        .goal-numbers {
          display: flex;
          align-items: baseline;
          gap: 4px;
          color: #94a3b8;
          font-size: 0.9rem;
        }
        
        .current-num {
          font-weight: 800;
          color: #f8fafc;
        }
        
        .goal-quick-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .mini-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mini-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .premium-progress-wrapper {
          width: 100%;
        }
        
        .progress-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .percent-text { color: #f8fafc; }
        .status-text { color: #64748b; text-transform: uppercase; }
        
        .premium-progress-bar {
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          overflow: hidden;
        }
        
        .premium-progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 1s ease-in-out;
        }
        
        .completed { border-color: #10b981; }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .goal-modal {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          width: 100%;
          max-width: 440px;
          padding: 32px;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .close-btn {
          background: none; border: none; color: #64748b; font-size: 1.2rem; cursor: pointer;
        }
        
        .premium-form { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
        
        .premium-form input:not([type="color"]) {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          color: white;
          outline: none;
        }
        
        .premium-form input:focus { border-color: #6366f1; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .primary-btn {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer;
        }
        
        .full-width { width: 100%; margin-top: 10px; }
      `}</style>
    </div>
  );
};
