import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionItem } from '../../molecules/TransactionItem';
import { DateRangePicker } from '../../molecules/DateRangePicker';
import { EmptyState } from '../../molecules/EmptyState';
import type { Transaction } from '../../../models/types';
import { useData } from '../../../contexts/DataContext';
import { exportToCSV } from '../../../utils/exportUtils';

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
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
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
      const rawName = tx?.createdByName || 'Unknown';
      // Extract a short readable name: use part before @ if it's an email
      const displayName = rawName.includes('@') ? rawName.split('@')[0] : rawName;
      return { uid, name: displayName };
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

  const handleTabChange = (type: 'all' | 'expense' | 'income' | 'transfer') => {
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
      <div className="transaction-list__header" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <h3 className="section-title" style={{ marginBottom: 0 }}>{displayTitle}</h3>
        <button 
          className="btn-premium btn-premium--sm"
          onClick={() => exportToCSV(filteredTransactions, categories)}
        >
          {t('common.exportCsv')}
        </button>
      </div>

      <div className="transaction-list__header-tabs" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        
        <div className="tab-switcher" style={{ width: '100%' }}>
          <div 
            className={`tab-item ${activeTab === 'all' ? 'tab-item--active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            {t('common.all')}
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
          <div 
            className={`tab-item ${activeTab === 'transfer' ? 'tab-item--active tab-item--transfer' : ''}`}
            onClick={() => handleTabChange('transfer')}
          >
            🔄 {t('common.transfers')}
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="transaction-list__filters">
          <input 
            className="input" 
            type="text" 
            placeholder={t('common.search')} 
            style={{ flex: 1, minWidth: '150px' }}
            value={search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
          {members.length > 1 && (
            <div className="member-chips">
              <button
                className={`member-chip ${memberFilter === 'all' ? 'member-chip--active' : ''}`}
                onClick={() => handleFilterChange({ member: 'all' })}
              >
                {t('common.allMembers')}
              </button>
              {members.map(m => (
                <button
                  key={m.uid}
                  className={`member-chip ${memberFilter === m.uid ? 'member-chip--active' : ''}`}
                  onClick={() => handleFilterChange({ member: m.uid })}
                >
                  👤 {m.name}
                </button>
              ))}
            </div>
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
            title={t('common.noTransactions')} 
            description={t('common.noTransactionsDesc')}
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
