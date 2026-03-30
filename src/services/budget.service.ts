import type { Transaction, FilterOptions, BudgetSummary, CategorySummary, Category } from '../models/types';
import { getTransactions, getCategories } from './storage.service';

export function getBudgetSummary(filters: FilterOptions = {}): BudgetSummary {
  const transactions = getFilteredTransactions(filters);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export function getFilteredTransactions(filters: FilterOptions = {}): Transaction[] {
  let transactions = getTransactions();

  if (filters.type && filters.type !== 'all') {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  if (filters.categoryId) {
    transactions = transactions.filter(t => t.categoryId === filters.categoryId);
  }
  if (filters.dateFrom) {
    transactions = transactions.filter(t => t.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    transactions = transactions.filter(t => t.date <= filters.dateTo!);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    transactions = transactions.filter(t =>
      t.description.toLowerCase().includes(q)
    );
  }

  return transactions.sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    return dateDiff !== 0 ? dateDiff : b.createdAt - a.createdAt;
  });
}

export function getRecentTransactions(count: number = 5, filters: FilterOptions = {}): Transaction[] {
  return getFilteredTransactions(filters).slice(0, count);
}

export function getCategoryBreakdown(type: 'expense' | 'income' = 'expense', filters: FilterOptions = {}): CategorySummary[] {
  const transactions = getFilteredTransactions({ ...filters, type });
  const categories = getCategories().filter(c => c.type === type);
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<string, { category: Category; amount: number; count: number }>();

  for (const cat of categories) {
    map.set(cat.id, { category: cat, amount: 0, count: 0 });
  }

  for (const t of transactions) {
    const entry = map.get(t.categoryId);
    if (entry) {
      entry.amount += t.amount;
      entry.count++;
    }
  }

  return Array.from(map.values())
    .filter(e => e.amount > 0)
    .map(e => ({
      category: e.category,
      total: e.amount,
      percentage: total > 0 ? (e.amount / total) * 100 : 0,
      count: e.count,
    }))
    .sort((a, b) => b.total - a.total);
}
