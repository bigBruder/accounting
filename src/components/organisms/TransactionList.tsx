import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionItem } from '../molecules/TransactionItem';
import { DateRangePicker } from '../molecules/DateRangePicker';
import { EmptyState } from '../molecules/EmptyState';
import type { Transaction } from '../../models/types';
import { useData } from '../../contexts/DataContext';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  compact?: boolean;
  showFilters?: boolean;
  onDelete?: (id: string) => void;
  onFilterChange?: (filters: { type: string; search: string; dateFrom: string; dateTo: string }) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  title, 
  compact = false, 
  showFilters = false,
  onDelete,
  onFilterChange
}) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const displayTitle = title || t('common.transactions');
  const { categories } = useData();

  const handleFilterChange = (updates: Partial<{ type: string; search: string; dateFrom: string; dateTo: string }>) => {
    const newFilters = {
      type: updates.type ?? filterType,
      search: updates.search ?? search,
      dateFrom: updates.dateFrom ?? dateFrom,
      dateTo: updates.dateTo ?? dateTo,
    };
    
    if (updates.type !== undefined) setFilterType(updates.type);
    if (updates.search !== undefined) setSearch(updates.search);
    if (updates.dateFrom !== undefined) setDateFrom(updates.dateFrom);
    if (updates.dateTo !== undefined) setDateTo(updates.dateTo);
    
    onFilterChange?.(newFilters);
  };

  return (
    <div className="transaction-list">
      <div className="transaction-list__header">
        <h3 className="section-title" style={{ marginBottom: 0 }}>{displayTitle}</h3>
      </div>
      
      {showFilters && (
        <div className="transaction-list__filters">
          <select 
            className="select" 
            style={{ width: 'auto', minWidth: '130px' }}
            value={filterType}
            onChange={(e) => handleFilterChange({ type: e.target.value })}
          >
            <option value="all">{t('common.allTypes', { defaultValue: 'Всі типи' })}</option>
            <option value="income">{t('common.income')}</option>
            <option value="expense">{t('common.expenses')}</option>
          </select>
          <input 
            className="input" 
            type="text" 
            placeholder={t('common.search', { defaultValue: 'Пошук...' })} 
            style={{ width: 'auto', minWidth: '180px' }}
            value={search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
          <DateRangePicker 
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={(from, to) => handleFilterChange({ dateFrom: from, dateTo: to })}
          />
        </div>
      )}

      <div className={`transaction-list__body ${compact ? 'transaction-list__body--compact' : ''}`}>
        {transactions.length === 0 ? (
          <EmptyState 
            icon="📭" 
            title={t('common.noTransactions', { defaultValue: 'Немає транзакцій' })} 
            description={t('common.noTransactionsDesc', { defaultValue: 'Додайте першу транзакцію, щоб почати відстежувати бюджет' })}
          />
        ) : (
          transactions.map((transaction) => (
            <TransactionItem 
              key={transaction.id}
              transaction={transaction}
              category={categories.find(c => c.id === transaction.categoryId)}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
