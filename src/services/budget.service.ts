import type { Transaction, FilterOptions, BudgetSummary, CategorySummary, Category } from '../models/types';

export function getBudgetSummary(transactions: Transaction[], filters: FilterOptions = {}): BudgetSummary {
  const filtered = getFilteredTransactions(transactions, filters);
  const totalIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export function getFilteredTransactions(transactions: Transaction[], filters: FilterOptions = {}): Transaction[] {
  let result = [...transactions];

  if (filters.type && filters.type !== 'all') {
    result = result.filter(t => t.type === filters.type);
  }
  if (filters.categoryId) {
    result = result.filter(t => t.categoryId === filters.categoryId);
  }
  if (filters.dateFrom) {
    result = result.filter(t => t.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    result = result.filter(t => t.date <= filters.dateTo!);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(t =>
      t.description.toLowerCase().includes(q)
    );
  }

  return result.sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    return dateDiff !== 0 ? dateDiff : b.createdAt - a.createdAt;
  });
}

export function getRecentTransactions(transactions: Transaction[], count: number = 5, filters: FilterOptions = {}): Transaction[] {
  return getFilteredTransactions(transactions, filters).slice(0, count);
}

export function getCategoryBreakdown(transactions: Transaction[], categories: Category[], type: 'expense' | 'income' = 'expense', filters: FilterOptions = {}): CategorySummary[] {
  const filtered = getFilteredTransactions(transactions, { ...filters, type });
  const typeCategories = categories.filter(c => c.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<string, { category: Category; amount: number; count: number }>();

  for (const cat of typeCategories) {
    map.set(cat.id, { category: cat, amount: 0, count: 0 });
  }

  for (const t of filtered) {
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
