import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionForm } from '../organisms/TransactionForm';
import { TransactionList } from '../organisms/TransactionList';
import { addTransaction, deleteTransaction } from '../../services/storage.service';
import { getFilteredTransactions } from '../../services/budget.service';
import { eventBus, Events } from '../../services/event-bus';
import type { FilterOptions } from '../../models/types';

export const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [transactions, setTransactions] = useState(getFilteredTransactions());

  const refreshList = () => {
    setTransactions(getFilteredTransactions(filters));
  };

  useEffect(() => {
    refreshList();
    eventBus.on(Events.TRANSACTION_ADDED, refreshList);
    eventBus.on(Events.TRANSACTION_DELETED, refreshList);
    return () => {
      eventBus.off(Events.TRANSACTION_ADDED, refreshList);
      eventBus.off(Events.TRANSACTION_DELETED, refreshList);
    };
  }, [filters]);

  const handleSubmit = (data: any) => {
    addTransaction(data);
    eventBus.emit(Events.TRANSACTION_ADDED);
    refreshList();
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    eventBus.emit(Events.TRANSACTION_DELETED);
    refreshList();
  };

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
          transactions={transactions}
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
