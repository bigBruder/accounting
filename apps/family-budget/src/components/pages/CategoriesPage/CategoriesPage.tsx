import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addCategory, deleteCategory } from '../../../services/firestore.service';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { TransactionType, Category } from '../../../models/types';
import { Icon } from '../../atoms/Icon';

export const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { categories, loading } = useData();
  const { familyId } = useAuth();
  const [newCat, setNewCat] = useState({ name: '', icon: '🏷️', color: '#8b5cf6', type: 'expense' as TransactionType });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name || !newCat.icon || !familyId) return;
    await addCategory(familyId, newCat);
    setNewCat({ name: '', icon: '🏷️', color: '#8b5cf6', type: 'expense' });
  };

  const handleDelete = async (id: string) => {
    if (familyId) {
      await deleteCategory(familyId, id);
    }
  };

  if (loading) return <div>Loading...</div>;

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('common.categories')}</h1>
        <p className="page-subtitle">{t('common.manageCategoriesDesc', { defaultValue: 'Керуйте категоріями доходів та витрат' })}</p>
      </div>

      <div className="card add-category-form" style={{ marginBottom: 'var(--space-8)' }}>
        <h3 className="section-title">{t('common.addCategory', { defaultValue: 'Додати категорію' })}</h3>
        <form onSubmit={handleSubmit} className="add-category-form__row">
          <div className="form-field">
            <label className="form-field__label">{t('common.name', { defaultValue: 'Назва' })}</label>
            <input 
              className="input" 
              type="text" 
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              placeholder={t('common.categoryName', { defaultValue: 'Назва категорії' })} 
              required 
            />
          </div>
          <div className="form-field">
            <label className="form-field__label">{t('common.emoji', { defaultValue: 'Emoji' })}</label>
            <input 
              className="input" 
              type="text" 
              value={newCat.icon}
              onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
              placeholder="🏷️" 
              maxLength={4} 
              required 
            />
          </div>
          <div className="form-field">
            <label className="form-field__label">{t('common.color', { defaultValue: 'Колір' })}</label>
            <input 
              className="input" 
              type="color" 
              value={newCat.color}
              onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-field__label">{t('common.type')}</label>
            <select 
              className="select" 
              value={newCat.type}
              onChange={(e) => setNewCat({ ...newCat, type: e.target.value as TransactionType })}
            >
              <option value="expense">{t('common.expenses')}</option>
              <option value="income">{t('common.income')}</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-end' }}>
            {t('common.add', { defaultValue: 'Додати' })}
          </button>
        </form>
      </div>

      <h3 className="section-title">{t('common.expenses')}</h3>
      <div className="category-grid" style={{ marginBottom: 'var(--space-8)' }}>
        {expenseCategories.map(c => (
          <CategoryCard key={c.id} category={c} onDelete={handleDelete} typeLabel={t('common.expense')} />
        ))}
      </div>

      <h3 className="section-title">{t('common.income')}</h3>
      <div className="category-grid">
        {incomeCategories.map(c => (
          <CategoryCard key={c.id} category={c} onDelete={handleDelete} typeLabel={t('common.income')} />
        ))}
      </div>
    </div>
  );
};

interface CategoryCardProps {
  category: Category;
  onDelete: (id: string) => void;
  typeLabel: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onDelete, typeLabel }) => (
  <div className="category-card">
    <div className="category-card__icon" style={{ background: `${category.color}20`, color: category.color }}>{category.icon}</div>
    <div className="category-card__info">
      <div className="category-card__name">{category.name}</div>
      <div className="category-card__type">{typeLabel}</div>
    </div>
    <button 
      className="btn btn--danger btn--icon btn--sm category-card__delete" 
      onClick={() => onDelete(category.id)} 
      title="Видалити"
    >
      <Icon name="trash" />
    </button>
  </div>
);
