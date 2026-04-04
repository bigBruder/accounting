import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction, Category } from '../models/types';
import { DEFAULT_CATEGORIES } from '../models/types';

export const addTransaction = async (familyId: string, data: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> => {
  const colRef = collection(db, `families/${familyId}/transactions`);
  const docRef = doc(colRef);
  await setDoc(docRef, {
    ...data,
    id: docRef.id,
    createdAt: Date.now(),
  });
};

export const deleteTransaction = async (familyId: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, `families/${familyId}/transactions/${id}`));
};

export const updateTransaction = async (familyId: string, id: string, data: Partial<Transaction>): Promise<void> => {
  await updateDoc(doc(db, `families/${familyId}/transactions/${id}`), data);
};

export const addCategory = async (familyId: string, data: Omit<Category, 'id'>): Promise<void> => {
  const colRef = collection(db, `families/${familyId}/categories`);
  const docRef = doc(colRef);
  await setDoc(docRef, { ...data, id: docRef.id });
};

export const deleteCategory = async (familyId: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, `families/${familyId}/categories/${id}`));
};

export const initializeDefaultCategories = async (familyId: string): Promise<void> => {
  const colRef = collection(db, `families/${familyId}/categories`);
  for (const cat of DEFAULT_CATEGORIES) {
    await setDoc(doc(colRef, cat.id), cat);
  }
};
