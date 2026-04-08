import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionForm } from '../../organisms/TransactionForm';
import { TransactionList } from '../../organisms/TransactionList';
import { addTransaction, deleteTransaction } from '../../../services/firestore.service';
import { getFilteredTransactions } from '../../../services/budget.service';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import type { FilterOptions } from '../../../models/types';

export const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterOptions>({});
  const { transactions, loading } = useData();
  const { familyId } = useAuth();

  const filteredTransactions = getFilteredTransactions(transactions, filters);

  const handleSubmit = async (data: any) => {
    if (familyId) {
      await addTransaction(familyId, data);
    }
  };

  const handleDelete = async (id: string) => {
    if (familyId) {
      await deleteTransaction(familyId, id);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('common.transactions')}</h1>
        <p className="page-subtitle">{t('common.manageTransactions', { defaultValue: 'Керуйте вашими доходами та витратами' })}</p>
      </div>
      
      <div id="transaction-form-container" style={{ marginBottom: 'var(--space-6)' }}>
        <TransactionForm onSubmit={handleSubmit} />
      </div>
      
      <div id="transaction-list-container">
        <TransactionList 
          transactions={filteredTransactions}
          title={t('common.allTransactions', { defaultValue: 'Усі транзакції' })}
          showFilters={true}
          onDelete={handleDelete}
          onFilterChange={(f) => setFilters({
            type: f.type === 'all' ? undefined : f.type as 'income' | 'expense',
            search: f.search || undefined,
            dateFrom: f.dateFrom || undefined,
            dateTo: f.dateTo || undefined,
          })}
        />
      </div>
    </div>
  );
};
