import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../contexts/DataContext';
import { formatAmount } from '../../../utils/formatters';
import styles from './GoalsWidget.module.css';

interface GoalFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onClose, onSave }) => {
  const { t } = useTranslation();
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
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{t('goals.addTitle')}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>{t('goals.name')}</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder={t('goals.namePlaceholder')} 
              required 
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>{t('goals.targetAmount')}</label>
              <input 
                type="number" 
                value={targetAmount} 
                onChange={e => setTargetAmount(e.target.value)} 
                placeholder="0.00" 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('goals.currentAmount')}</label>
              <input 
                type="number" 
                value={currentAmount} 
                onChange={e => setCurrentAmount(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>{t('goals.emoji')}</label>
              <input 
                type="text" 
                value={icon} 
                onChange={e => setIcon(e.target.value)} 
                maxLength={2}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('goals.color')}</label>
              <input 
                type="color" 
                value={color} 
                onChange={e => setColor(e.target.value)} 
              />
            </div>
          </div>
          <button type="submit" className={`${styles.primaryBtn} ${styles.fullWidth}`}>{t('goals.create')}</button>
        </form>
      </div>
    </div>
  );
};

export const GoalsWidget: React.FC = () => {
  const { t } = useTranslation();
  const { goals, addGoal, updateGoal, deleteGoal } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateProgress = (goalId: string, current: number, target: number) => {
    const amount = prompt(t('goals.addProgressPrompt'), '0');
    if (amount) {
      const newAmount = current + parseFloat(amount);
      updateGoal(goalId, { currentAmount: Math.min(newAmount, target) });
    }
  };

  return (
    <div className={styles.goalsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <h3 className={styles.sectionTitle}>{t('goals.title')}</h3>
          <span className={styles.countBadge}>{goals.length}</span>
        </div>
        <button className={styles.createGoalBtn} onClick={() => setIsModalOpen(true)}>
          <span className={styles.plusIcon}>+</span> {t('goals.create')}
        </button>
      </div>

      <div className={styles.goalsGrid}>
        {goals.length === 0 ? (
          <div className={styles.emptyCard}>
            <p className={styles.emptyText}>{t('goals.empty')}</p>
            <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>{t('goals.addFirst')}</button>
          </div>
        ) : (
          goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;
            
            return (
              <div key={goal.id} className={`${styles.goalCard} ${isCompleted ? styles.goalCardCompleted : ''}`}>
                <div className={styles.cardTop}>
                  <div className="goal-visual">
                    <div className={styles.iconBubble} style={{ backgroundColor: `${goal.color}20`, borderColor: goal.color }}>
                      {goal.icon}
                    </div>
                  </div>
                  <div className={styles.mainInfo}>
                    <h4 className={styles.goalTitle}>{goal.name}</h4>
                    <div className={styles.numbers}>
                      <span className={styles.currentNum}>{formatAmount(goal.currentAmount).replace('₴', '')}</span>
                      <span className="of-separator">{t('goals.of')}</span>
                      <span className="target-num">{formatAmount(goal.targetAmount)}</span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button 
                      className={`${styles.miniBtn} add-btn`} 
                      onClick={() => handleUpdateProgress(goal.id, goal.currentAmount, goal.targetAmount)}
                      title={t('goals.addProgressPrompt')}
                    >
                      💰
                    </button>
                    <button 
                      className={`${styles.miniBtn} del-btn`} 
                      onClick={() => { if(confirm(t('goals.deleteConfirm'))) deleteGoal(goal.id) }}
                      title={t('common.delete')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className={styles.cardBottom}>
                  <div className={styles.progressWrapper}>
                    <div className={styles.progressMeta}>
                      <span className={styles.percentText}>{Math.round(progress)}% </span>
                      <span className={styles.statusText}>{isCompleted ? t('goals.completed') : t('goals.inProgress')}</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
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
    </div>
  );
};
