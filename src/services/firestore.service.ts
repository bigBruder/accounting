import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction, Category } from '../models/types';
import { DEFAULT_CATEGORIES } from '../models/types';

export const addTransaction = async (uid: string, data: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> => {
  const colRef = collection(db, `users/${uid}/transactions`);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...data,
    id: docRef.id,
    createdAt: Date.now(),
  });
};

export const deleteTransaction = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, `users/${uid}/transactions/${id}`));
};

export const updateTransaction = async (uid: string, id: string, data: Partial<Transaction>): Promise<void> => {
  await updateDoc(doc(db, `users/${uid}/transactions/${id}`), data);
};

export const addCategory = async (uid: string, data: Omit<Category, 'id'>): Promise<void> => {
  const colRef = collection(db, `users/${uid}/categories`);
  const docRef = doc(colRef);
  await setDoc(docRef, { ...data, id: docRef.id });
};

export const deleteCategory = async (uid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, `users/${uid}/categories/${id}`));
};

export const initializeDefaultCategories = async (uid: string): Promise<void> => {
  const colRef = collection(db, `users/${uid}/categories`);
  for (const cat of DEFAULT_CATEGORIES) {
    await setDoc(doc(colRef, cat.id), cat);
  }
};
