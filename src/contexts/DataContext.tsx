import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import type { Transaction, Category } from '../models/types';
import { initializeDefaultCategories, addTransaction } from '../services/firestore.service';
import { MonobankService } from '../services/monobank.service';

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  syncMonobank: (manualToken?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType>({ 
  transactions: [], 
  categories: [], 
  loading: true,
  syncMonobank: async (_?: string) => {} 
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, familyId, monobankToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !familyId) {
      setTransactions([]);
      setCategories([]);
      if (!user) setLoading(false);
      return;
    }

    setLoading(true);

    const txCol = collection(db, `families/${familyId}/transactions`);
    const catCol = collection(db, `families/${familyId}/categories`);

    const unsubTx = onSnapshot(txCol, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Transaction);
      setTransactions(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unsubCat = onSnapshot(catCol, async (snapshot) => {
      let data = snapshot.docs.map(doc => doc.data() as Category);
      if (data.length === 0) {
        await initializeDefaultCategories(familyId);
      } else {
        setCategories(data);
      }
    });

    const loadTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      unsubTx();
      unsubCat();
      clearTimeout(loadTimeout);
    };
  }, [user, familyId]);

  const syncMonobank = async (manualToken?: string) => {
    const activeToken = manualToken || monobankToken;
    if (!user || !familyId || !activeToken) {
      throw new Error('Monobank token not found. Please add it in settings.');
    }

    try {
      const clientInfo = await MonobankService.getClientInfo(activeToken);
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60);

      const existingExternalIds = new Set(
        transactions
          .filter(t => t.externalId)
          .map(t => t.externalId)
      );

      const syncPromises: Promise<any>[] = [];
      
      for (const account of clientInfo.accounts) {
        // Fetch last 30 days of transactions for this account
        const monoTxs = await MonobankService.getStatement(activeToken, account.id, thirtyDaysAgo);
        
        for (const tx of monoTxs) {
          if (existingExternalIds.has(tx.id)) continue;

          const categoryId = MonobankService.mapToCategoryId(tx.mcc, tx.description);
          const category = categories.find(c => c.id === categoryId) || 
                           categories.find(c => c.id === 'other-expense');

          syncPromises.push(addTransaction(familyId, {
            type: tx.amount > 0 ? 'income' : 'expense',
            amount: Math.abs(tx.amount / 100),
            categoryId: category?.id || 'other-expense',
            description: tx.description,
            date: new Date(tx.time * 1000).toISOString().split('T')[0],
            createdAt: tx.time * 1000,
            externalId: tx.id,
            createdBy: user.uid,
            createdByName: user.displayName || user.email || 'Невідомий'
          }));
        }
      }
      
      if (syncPromises.length > 0) {
        await Promise.all(syncPromises);
        console.log(`Successfully synced ${syncPromises.length} transactions from Monobank.`);
      }
    } catch (error) {
      console.error('Failed to sync Monobank:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{ transactions, categories, loading, syncMonobank }}>
      {children}
    </DataContext.Provider>
  );
};
