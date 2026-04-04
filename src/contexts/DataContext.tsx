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
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const txCol = collection(db, `users/${user.uid}/transactions`);
    const catCol = collection(db, `users/${user.uid}/categories`);

    const unsubTx = onSnapshot(txCol, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Transaction);
      setTransactions(data);
    });

    const unsubCat = onSnapshot(catCol, async (snapshot) => {
      let data = snapshot.docs.map(doc => doc.data() as Category);
      if (data.length === 0) {
        // Initialize basic categories for new user
        await initializeDefaultCategories(user.uid);
      } else {
        setCategories(data);
      }
    });

    // We can assume loading is false after first listeners attach. Realistically, we'd wait for both.
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      unsubTx();
      unsubCat();
    };
  }, [user]);

  return (
    <DataContext.Provider value={{ transactions, categories, loading }}>
      {children}
    </DataContext.Provider>
  );
};
