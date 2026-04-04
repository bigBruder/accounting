import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import type { Transaction, Category } from '../models/types';
import { initializeDefaultCategories, addTransaction, getFamilyMembers } from '../services/firestore.service';
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
  const { user, familyId } = useAuth();
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
    if (!user || !familyId) {
      throw new Error('Monobank token not found. Please add it in settings.');
    }

    try {
      interface TokenInfo {
        token: string;
        ownerUid: string;
        ownerName: string;
      }

      const tokensToSync: TokenInfo[] = [];

      if (manualToken) {
        tokensToSync.push({
          token: manualToken,
          ownerUid: user.uid,
          ownerName: user.displayName || user.email || 'Невідомий',
        });
      } else {
        const members = await getFamilyMembers(familyId);
        for (const member of members) {
          if (member.monobankToken) {
            tokensToSync.push({
              token: member.monobankToken,
              ownerUid: member.uid,
              ownerName: member.displayName || member.email || 'Невідомий',
            });
          }
        }
      }

      if (tokensToSync.length === 0) {
        throw new Error('Жоден член сім\'ї не підключив Monobank токен.');
      }

      const existingExternalIds = new Set(
        transactions
          .filter(t => t.externalId)
          .map(t => t.externalId)
      );

      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60);

      // Phase 1: Collect all new transactions from all members
      interface PendingTransaction {
        type: 'income' | 'expense';
        amount: number;
        categoryId: string;
        description: string;
        date: string;
        createdAt: number;
        externalId: string;
        createdBy: string;
        createdByName: string;
        rawAmount: number; // original signed amount in kopecks for transfer matching
      }

      const pendingTransactions: PendingTransaction[] = [];

      for (const { token, ownerUid, ownerName } of tokensToSync) {
        try {
          const clientInfo = await MonobankService.getClientInfo(token);

          for (const account of clientInfo.accounts) {
            const monoTxs = await MonobankService.getStatement(token, account.id, thirtyDaysAgo);

            for (const tx of monoTxs) {
              if (existingExternalIds.has(tx.id)) continue;
              existingExternalIds.add(tx.id);

              const categoryId = MonobankService.mapToCategoryId(tx.mcc, tx.description);
              const category = categories.find(c => c.id === categoryId) ||
                               categories.find(c => c.id === 'other-expense');

              pendingTransactions.push({
                type: tx.amount > 0 ? 'income' : 'expense',
                amount: Math.abs(tx.amount / 100),
                categoryId: category?.id || 'other-expense',
                description: tx.description,
                date: new Date(tx.time * 1000).toISOString().split('T')[0],
                createdAt: tx.time * 1000,
                externalId: tx.id,
                createdBy: ownerUid,
                createdByName: clientInfo.name || ownerName,
                rawAmount: tx.amount,
              });
            }
          }

          console.log(`Fetched transactions for ${ownerName}`);
        } catch (memberError) {
          console.error(`Failed to fetch Monobank for ${ownerName}:`, memberError);
        }
      }

      // Phase 2: Detect internal family transfers
      // A transfer pair = one member has -X and another has +X within 5 minutes
      const matched = new Set<number>();
      const TIME_THRESHOLD = 5 * 60 * 1000; // 5 minutes in ms

      for (let i = 0; i < pendingTransactions.length; i++) {
        if (matched.has(i)) continue;
        const txA = pendingTransactions[i];

        for (let j = i + 1; j < pendingTransactions.length; j++) {
          if (matched.has(j)) continue;
          const txB = pendingTransactions[j];

          // Different owners, same absolute amount, opposite signs, close in time
          if (
            txA.createdBy !== txB.createdBy &&
            Math.abs(txA.amount - txB.amount) < 0.01 &&
            ((txA.rawAmount > 0 && txB.rawAmount < 0) || (txA.rawAmount < 0 && txB.rawAmount > 0)) &&
            Math.abs(txA.createdAt - txB.createdAt) <= TIME_THRESHOLD
          ) {
            matched.add(i);
            matched.add(j);
            break;
          }
        }
      }

      // Phase 3: Write all transactions, marking matched ones as 'transfer'
      const syncPromises: Promise<any>[] = [];

      for (let i = 0; i < pendingTransactions.length; i++) {
        const tx = pendingTransactions[i];
        const isTransfer = matched.has(i);

        syncPromises.push(addTransaction(familyId, {
          type: isTransfer ? 'transfer' : tx.type,
          amount: tx.amount,
          categoryId: isTransfer ? 'transfer' : tx.categoryId,
          description: tx.description,
          date: tx.date,
          createdAt: tx.createdAt,
          externalId: tx.externalId,
          createdBy: tx.createdBy,
          createdByName: tx.createdByName,
        }));
      }

      if (syncPromises.length > 0) {
        await Promise.all(syncPromises);
      }

      const transferCount = matched.size;
      console.log(`Total synced: ${syncPromises.length} transactions (${transferCount / 2} transfer pairs detected).`);
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
