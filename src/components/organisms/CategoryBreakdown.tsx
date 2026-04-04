import React from 'react';
import { useTranslation } from 'react-i18next';
import { getCategoryBreakdown } from '../../services/budget.service';
import { formatAmount } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';
import type { FilterOptions } from '../../models/types';

interface CategoryBreakdownProps {
  filters?: FilterOptions;
  activeCategoryId?: string;
  onCategoryClick?: (id: string) => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ 
  filters = {}, 
  activeCategoryId,
  onCategoryClick 
}) => {
  const { t } = useTranslation();
  const { transactions, categories } = useData();
  const items = getCategoryBreakdown(transactions, categories, 'expense', filters);

  const title = t('common.categoryBreakdown', { defaultValue: 'Витрати по категоріях' });

  if (items.length === 0) {
    return (
      <div className="category-breakdown">
        <h3 className="section-title">{title}</h3>
        <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
          <div className="empty-state__icon">📊</div>
          <div className="empty-state__desc">{t('common.addExpensesToShow', { defaultValue: 'Додайте витрати, щоб побачити розбивку' })}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-breakdown">
      <h3 className="section-title">{title}</h3>
      <div className="category-breakdown__list">
        {items.map((item) => (
          <div 
            key={item.category.id} 
            className={`category-breakdown__item ${activeCategoryId === item.category.id ? 'category-breakdown__item--active' : ''}`}
            onClick={() => onCategoryClick?.(item.category.id)}
            style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
          >
            <div className="category-breakdown__icon" style={{ background: `${item.category.color}20`, color: item.category.color }}>
              {item.category.icon}
            </div>
            <div className="category-breakdown__info">
              <div className="category-breakdown__name">{item.category.name}</div>
              <div className="category-breakdown__bar">
                <div 
                  className="category-breakdown__bar-fill" 
                  style={{ width: `${item.percentage}%`, background: item.category.color }}
                ></div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="category-breakdown__amount">{formatAmount(item.total)}</div>
              <div className="category-breakdown__percentage">{item.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
