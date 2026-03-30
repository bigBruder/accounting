import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatCard } from '../molecules/StatCard';
import { getBudgetSummary } from '../../services/budget.service';
import type { FilterOptions } from '../../models/types';

interface DashboardStatsProps {
  filters?: FilterOptions;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ filters = {} }) => {
  const { t } = useTranslation();
  const summary = getBudgetSummary(filters);

  return (
    <div className="grid-3">
      <StatCard
        label={t('common.balance')}
        value={summary.balance}
        icon="💰"
        type="balance"
      />
      <StatCard
        label={t('common.income')}
        value={summary.totalIncome}
        icon="📈"
        type="income"
      />
      <StatCard
        label={t('common.expenses')}
        value={summary.totalExpense}
        icon="📉"
        type="expense"
      />
    </div>
  );
};
