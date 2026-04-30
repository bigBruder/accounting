import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardStats } from '../../organisms/DashboardStats';
import { TransactionList } from '../../organisms/TransactionList';
import { CategoryBreakdown } from '../../organisms/CategoryBreakdown';
import { ExpenseDonut } from '../../organisms/ExpenseDonut';
import { SpendingTrend } from '../../organisms/SpendingTrend';
import { GoalsWidget } from '../../organisms/GoalsWidget';
import { DateRangePicker } from '../../molecules/DateRangePicker';
import { MonoConnectModal } from '../../organisms/MonoConnectModal';
import { getFilteredTransactions } from '../../../services/budget.service';
import { deleteTransaction } from '../../../services/firestore.service';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import type { FilterOptions } from '../../../models/types';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  
  const defaultFrom = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const defaultTo = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: defaultFrom,
    dateTo: defaultTo
  });
  const { transactions, categories, loading, syncMonobank } = useData();
  const { familyId, monobankToken } = useAuth();
  const [syncLoading, setSyncLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isMonoModalOpen, setIsMonoModalOpen] = useState(false);
  
  const recentTransactions = getFilteredTransactions(transactions, filters);

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
      setCooldown(60);
      alert(t('dashboard.syncSuccess'));
    } catch (err: any) {
      alert(err.message || t('common.error'));
    } finally {
      setSyncLoading(false);
    }
  };

  const handleMonoSuccess = () => {
    setIsMonoModalOpen(false);
    setCooldown(60);
    alert(t('dashboard.monoConnected'));
  };

  const handleCategoryClick = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId
    }));
  };

  const handleDelete = async (id: string) => {
    if (familyId) {
      await deleteTransaction(familyId, id);
    }
  };

  if (loading) return (
    <div className={styles.loaderContainer}>
      <div className="loader">{t('dashboard.loading')}</div>
    </div>
  );

  return (
    <div className={`page ${styles.page}`}>
      <div className="page-header">
        <div className={styles.headerTop}>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <button 
            className={`mono-sync-btn ${syncLoading ? styles.monoSyncBtnLoading : ''} ${!monobankToken ? styles.monoBtnConnect : ''}`}
            onClick={handleSync}
            disabled={syncLoading || cooldown > 0}
          >
            <span className="mono-sync-btn__icon">🐈‍⬛</span>
            <span>
              {syncLoading 
                ? t('dashboard.syncing') 
                : !monobankToken 
                  ? t('dashboard.connectMono') 
                  : cooldown > 0 
                    ? t('dashboard.wait', { count: cooldown }) 
                    : t('dashboard.syncMono')
              }
            </span>
          </button>
        </div>
        <div className={styles.headerBottom}>
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
      
      {/* 1. TOP: Transactions + Category Breakdown */}
      <div className={`grid-2 ${styles.gridSection}`}>
        <div id="recent-transactions">
          <TransactionList 
            transactions={recentTransactions} 
            title={filters.categoryId ? `${t('common.allTransactions')} (${categories.find(c => c.id === filters.categoryId)?.name || '...' })` : t('common.allTransactions')} 
            compact={true}
            onDelete={handleDelete}
          />
        </div>
        <div id="category-breakdown">
          <CategoryBreakdown 
            filters={filters} 
            activeCategoryId={filters.categoryId}
            onCategoryClick={handleCategoryClick}
          />
        </div>
      </div>

      {/* 2. STATS */}
      <div className={styles.sectionGap}>
        <DashboardStats filters={filters} />
      </div>

      {/* 3. CHARTS ROW */}
      <div className={`grid-2 ${styles.sectionGap}`}>
        <div id="spending-trend">
          <SpendingTrend filters={filters} />
        </div>
        <div id="expense-donut">
          <ExpenseDonut 
            filters={filters} 
            activeCategoryId={filters.categoryId}
            onCategoryClick={handleCategoryClick}
          />
        </div>
      </div>

      {/* 4. GOALS */}
      <div className={styles.sectionGap}>
        <GoalsWidget />
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
