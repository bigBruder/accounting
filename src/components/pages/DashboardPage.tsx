import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardStats } from '../organisms/DashboardStats';
import { TransactionList } from '../organisms/TransactionList';
import { CategoryBreakdown } from '../organisms/CategoryBreakdown';
import { DateRangePicker } from '../molecules/DateRangePicker';
import { MonoConnectModal } from '../organisms/MonoConnectModal';
import { getRecentTransactions } from '../../services/budget.service';
import { deleteTransaction } from '../../services/firestore.service';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import type { FilterOptions } from '../../models/types';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterOptions>({});
  const { transactions, loading, syncMonobank } = useData();
  const { familyId, monobankToken } = useAuth();
  const [syncLoading, setSyncLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isMonoModalOpen, setIsMonoModalOpen] = useState(false);
  
  const recentTransactions = getRecentTransactions(transactions, 5, filters);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSync = async () => {
    if (!monobankToken) {
      setIsMonoModalOpen(true);
      return;
    }
    
    setSyncLoading(true);
    try {
      await syncMonobank();
      setCooldown(60); // Monobank rate limit is 60s
      alert('Синхронізація завершена успішно!');
    } catch (err: any) {
      alert(err.message || 'Помилка при синхронізації.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleMonoSuccess = () => {
    setIsMonoModalOpen(false);
    setCooldown(60);
    alert('Вітаємо! Ваш Monobank успішно підключено та синхронізовано.');
  };

  const handleDelete = async (id: string) => {
    if (familyId) {
      await deleteTransaction(familyId, id);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div className="loader">Завантаження...</div>
    </div>
  );

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <button 
            className={`mono-sync-btn ${syncLoading ? 'mono-sync-btn--loading' : ''} ${!monobankToken ? 'mono-btn-connect' : ''}`}
            onClick={handleSync}
            disabled={syncLoading || cooldown > 0}
            title={monobankToken ? 'Синхронізувати з Monobank' : 'Підключити Monobank'}
          >
            <span className="mono-sync-btn__icon">🐈‍⬛</span>
            <span>{syncLoading ? 'Оновлення...' : !monobankToken ? 'Connect Mono' : cooldown > 0 ? `Зачекайте ${cooldown}с` : 'Mono Sync'}</span>
          </button>
        </div>
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

      {isMonoModalOpen && (
        <MonoConnectModal 
          onClose={() => setIsMonoModalOpen(false)} 
          onSuccess={handleMonoSuccess} 
        />
      )}
    </div>
  );
};
