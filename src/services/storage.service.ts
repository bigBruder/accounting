import type { Transaction, Category } from '../models/types';
import { DEFAULT_CATEGORIES } from '../models/types';

const KEYS = {
  TRANSACTIONS: 'fb_transactions',
  CATEGORIES: 'fb_categories',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// --- Transactions ---

export function getTransactions(): Transaction[] {
  return load<Transaction[]>(KEYS.TRANSACTIONS, []);
}

export function addTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const transactions = getTransactions();
  const transaction: Transaction = {
    ...data,
    id: generateId(),
    createdAt: Date.now(),
  };
  transactions.unshift(transaction);
  save(KEYS.TRANSACTIONS, transactions);
  return transaction;
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions().filter(t => t.id !== id);
  save(KEYS.TRANSACTIONS, transactions);
}

export function updateTransaction(id: string, data: Partial<Transaction>): Transaction | null {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return null;
  transactions[index] = { ...transactions[index], ...data };
  save(KEYS.TRANSACTIONS, transactions);
  return transactions[index];
}

// --- Categories ---

export function getCategories(): Category[] {
  return load<Category[]>(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
}

export function addCategory(data: Omit<Category, 'id'>): Category {
  const categories = getCategories();
  const category: Category = { ...data, id: generateId() };
  categories.push(category);
  save(KEYS.CATEGORIES, categories);
  return category;
}

export function deleteCategory(id: string): void {
  // Don't allow deleting default categories
  const categories = getCategories().filter(c => c.id !== id);
  save(KEYS.CATEGORIES, categories);
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find(c => c.id === id);
}
