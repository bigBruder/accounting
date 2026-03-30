import React from 'react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  type: 'balance' | 'income' | 'expense';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, type = 'balance' }) => {
  const { t } = useTranslation();
  
  // Try to find a translation for the label, or use it as is
  const translatedLabel = t(`common.${type}`, { defaultValue: label });

  return (
    <div className={`stat-card stat-card--${type}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <p className="stat-card__label">{translatedLabel}</p>
        <p className="stat-card__value">
          {value.toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ₴
        </p>
      </div>
    </div>
  );
};
