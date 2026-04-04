import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardStats } from '../organisms/DashboardStats';
import { TransactionList } from '../organisms/TransactionList';
import { CategoryBreakdown } from '../organisms/CategoryBreakdown';
import { DateRangePicker } from '../molecules/DateRangePicker';
import { getRecentTransactions } from '../../services/budget.service';
import { deleteTransaction } from '../../services/firestore.service';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import type { FilterOptions } from '../../models/types';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterOptions>({});
  const { transactions, loading } = useData();
  const { user } = useAuth();
  
  const recentTransactions = getRecentTransactions(transactions, 5, filters);

  const handleDelete = async (id: string) => {
    if (user) {
      await deleteTransaction(user.uid, id);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('dashboard.title')}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
          <div id="dashboard-date-filter">
            <DateRangePicker 
              dateFrom={filters.dateFrom} 
              dateTo={filters.dateTo} 
              onChange={(from, to) => setFilters({ ...filters, dateFrom: from || undefined, dateTo: to || undefined })} 
            />
          </div>
        </div>
      </div>
      
      <DashboardStats filters={filters} />
      
      <div className="grid-2" style={{ marginTop: 'var(--space-6)' }}>
        <div id="recent-transactions">
          <TransactionList 
            transactions={recentTransactions} 
            title={t('dashboard.recentTransactions')} 
            compact={true}
            onDelete={handleDelete}
          />
        </div>
        <div id="category-breakdown">
          <CategoryBreakdown filters={filters} />
        </div>
      </div>
    </div>
  );
};
