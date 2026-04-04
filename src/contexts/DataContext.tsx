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
      // Gather all tokens to sync
      interface TokenInfo {
        token: string;
        ownerUid: string;
        ownerName: string;
      }

      const tokensToSync: TokenInfo[] = [];

      if (manualToken) {
        // Manual token override — only sync this one for the current user
        tokensToSync.push({
          token: manualToken,
          ownerUid: user.uid,
          ownerName: user.displayName || user.email || 'Невідомий',
        });
      } else {
        // Fetch all family members and collect their tokens
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
      let totalSynced = 0;

      for (const { token, ownerUid, ownerName } of tokensToSync) {
        try {
          const clientInfo = await MonobankService.getClientInfo(token);
          
          const syncPromises: Promise<any>[] = [];

          for (const account of clientInfo.accounts) {
            const monoTxs = await MonobankService.getStatement(token, account.id, thirtyDaysAgo);

            for (const tx of monoTxs) {
              if (existingExternalIds.has(tx.id)) continue;
              existingExternalIds.add(tx.id); // prevent duplicates within this sync batch

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
                createdBy: ownerUid,
                createdByName: clientInfo.name || ownerName,
              }));
            }
          }

          if (syncPromises.length > 0) {
            await Promise.all(syncPromises);
            totalSynced += syncPromises.length;
          }

          console.log(`Synced ${syncPromises.length} transactions for ${ownerName}`);
        } catch (memberError) {
          console.error(`Failed to sync Monobank for ${ownerName}:`, memberError);
          // Continue syncing other members even if one fails
        }
      }

      console.log(`Total synced: ${totalSynced} transactions from ${tokensToSync.length} member(s).`);
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
