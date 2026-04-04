import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import type { Transaction, Category } from '../models/types';
import { initializeDefaultCategories } from '../services/firestore.service';

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
}

const DataContext = createContext<DataContextType>({ transactions: [], categories: [], loading: true });

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, familyId } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for familyId to be available (fetched from user profile)
    if (!user || !familyId) {
      setTransactions([]);
      setCategories([]);
      // Only set loading false if we're sure there's no user or we've waited enough
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
        // Initialize basic categories for new family budget
        await initializeDefaultCategories(familyId);
      } else {
        setCategories(data);
      }
    });

    // We can consider loaded once we have some response or after a short delay
    const loadTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      unsubTx();
      unsubCat();
      clearTimeout(loadTimeout);
    };
  }, [user, familyId]);

  return (
    <DataContext.Provider value={{ transactions, categories, loading }}>
      {children}
    </DataContext.Provider>
  );
};
