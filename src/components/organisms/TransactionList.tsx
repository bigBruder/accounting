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
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const displayTitle = title || t('common.transactions');
  const { categories } = useData();

  // Extract unique members from transactions for the filter
  const members = Array.from(new Set(transactions.map(tx => tx.createdBy).filter(Boolean)))
    .map(uid => {
      const tx = transactions.find(t => t.createdBy === uid);
      return { uid, name: tx?.createdByName || 'Unknown' };
    });

  const handleFilterChange = (updates: Partial<{ type: string; search: string; member: string; dateFrom: string; dateTo: string }>) => {
    onFilterChange?.({
      type: updates.type || activeTab,
      search: updates.search ?? search,
      dateFrom: updates.dateFrom ?? dateFrom,
      dateTo: updates.dateTo ?? dateTo,
    });
    
    if (updates.search !== undefined) setSearch(updates.search);
    if (updates.member !== undefined) setMemberFilter(updates.member);
    if (updates.dateFrom !== undefined) setDateFrom(updates.dateFrom);
    if (updates.dateTo !== undefined) setDateTo(updates.dateTo);
  };

  const handleTabChange = (type: 'all' | 'expense' | 'income') => {
    setActiveTab(type);
    onFilterChange?.({ type, search, dateFrom, dateTo });
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesTab = activeTab === 'all' || tx.type === activeTab;
    const matchesMember = memberFilter === 'all' || tx.createdBy === memberFilter;
    const matchesSearch = !search || tx.description.toLowerCase().includes(search.toLowerCase());
    
    return matchesTab && matchesMember && matchesSearch;
  });

  return (
    <div className="transaction-list">
      <div className="transaction-list__header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
        <h3 className="section-title" style={{ marginBottom: 0 }}>{displayTitle}</h3>
        
        <div className="tab-switcher" style={{ width: '100%' }}>
          <div 
            className={`tab-item ${activeTab === 'all' ? 'tab-item--active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            {t('common.all', { defaultValue: 'Всі' })}
          </div>
          <div 
            className={`tab-item ${activeTab === 'expense' ? 'tab-item--active tab-item--expense' : ''}`}
            onClick={() => handleTabChange('expense')}
          >
            {t('common.expenses')}
          </div>
          <div 
            className={`tab-item ${activeTab === 'income' ? 'tab-item--active tab-item--income' : ''}`}
            onClick={() => handleTabChange('income')}
          >
            {t('common.income')}
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="transaction-list__filters">
          <input 
            className="input" 
            type="text" 
            placeholder={t('common.search', { defaultValue: 'Пошук...' })} 
            style={{ flex: 1, minWidth: '150px' }}
            value={search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
          {members.length > 1 && (
            <select 
              className="select" 
              style={{ width: 'auto', minWidth: '130px' }}
              value={memberFilter}
              onChange={(e) => handleFilterChange({ member: e.target.value })}
            >
              <option value="all">{t('common.allMembers', { defaultValue: 'Всі учасники' })}</option>
              {members.map(m => (
                <option key={m.uid} value={m.uid}>{m.name}</option>
              ))}
            </select>
          )}
          <DateRangePicker 
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={(from, to) => handleFilterChange({ dateFrom: from, dateTo: to })}
          />
        </div>
      )}

      <div className={`transaction-list__body ${compact ? 'transaction-list__body--compact' : ''}`}>
        {filteredTransactions.length === 0 ? (
          <EmptyState 
            icon="📭" 
            title={t('common.noTransactions', { defaultValue: 'Немає транзакцій' })} 
            description={t('common.noTransactionsDesc', { defaultValue: 'Тут поки нічого немає за вашим запитом.' })}
          />
        ) : (
          filteredTransactions.map((transaction) => (
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
