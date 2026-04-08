import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { TransactionFormData } from '../../../models/types';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Partial<TransactionFormData>;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, initialData }) => {
  const { t } = useTranslation();
  const { categories } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<TransactionFormData>({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    type: initialData?.type || 'expense',
    categoryId: initialData?.categoryId || (categories.length > 0 ? categories[0].id : ''),
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.categoryId) return;
    
    // Add user identification
    const enrichedData: TransactionFormData = {
      ...formData,
      createdBy: user?.uid || '',
      createdByName: user?.displayName || user?.email || t('common.unknownUser', { defaultValue: 'Невідомий' })
    };
    
    onSubmit(enrichedData);
    
    // Reset form after submit
    setFormData({
      description: '',
      amount: 0,
      type: 'expense',
      categoryId: categories.length > 0 ? categories[0].id : '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="card animate-fade-in">
      <h3 className="section-title">{t('common.addTransaction', { defaultValue: 'Додати транзакцію' })}</h3>
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="grid-2">
          <div className="form-group">
            <label className="label">{t('common.description', { defaultValue: 'Опис' })}</label>
            <input 
              type="text" 
              className="input" 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('common.descriptionPlaceholder', { defaultValue: 'Наприклад: Продукти' })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">{t('common.amount', { defaultValue: 'Сума' })}</label>
            <input 
              type="number" 
              step="0.01" 
              className="input" 
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div className="grid-3" style={{ marginTop: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="label">{t('common.type')}</label>
            <div className={`segmented-control segmented-control--${formData.type}`}>
              <button
                type="button"
                className={`segmented-control__item ${formData.type === 'expense' ? 'segmented-control__item--active' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'expense' })}
              >
                💸 {t('common.expenses')}
              </button>
              <button
                type="button"
                className={`segmented-control__item ${formData.type === 'income' ? 'segmented-control__item--active' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'income' })}
              >
                💰 {t('common.income')}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="label">{t('common.category')}</label>
            <select 
              className="select" 
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">{t('common.date', { defaultValue: 'Дата' })}</label>
            <input 
              type="date" 
              className="input" 
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>
        
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'right' }}>
          <button type="submit" className="btn btn--primary">
            {t('common.save', { defaultValue: 'Зберегти' })}
          </button>
        </div>
      </form>
    </div>
  );
};
