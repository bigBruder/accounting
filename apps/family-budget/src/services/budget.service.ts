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

export interface DailyData {
  date: string;
  label: string;
  expense: number;
  income: number;
}

export function getDailySpending(transactions: Transaction[], filters: FilterOptions = {}): DailyData[] {
  const filtered = getFilteredTransactions(transactions, filters)
    .filter(t => t.type === 'expense' || t.type === 'income');

  const map = new Map<string, { expense: number; income: number }>();

  for (const t of filtered) {
    const existing = map.get(t.date) || { expense: 0, income: 0 };
    if (t.type === 'expense') {
      existing.expense += t.amount;
    } else {
      existing.income += t.amount;
    }
    map.set(t.date, existing);
  }

  return Array.from(map.entries())
    .map(([date, data]) => ({
      date,
      label: new Date(date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }),
      expense: Math.round(data.expense * 100) / 100,
      income: Math.round(data.income * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface MonthlyData {
  month: string;
  label: string;
  expense: number;
  income: number;
}

export function getMonthlyComparison(transactions: Transaction[]): MonthlyData[] {
  const map = new Map<string, { expense: number; income: number }>();

  for (const t of transactions) {
    if (t.type === 'transfer') continue;
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    const existing = map.get(monthKey) || { expense: 0, income: 0 };
    if (t.type === 'expense') {
      existing.expense += t.amount;
    } else if (t.type === 'income') {
      existing.income += t.amount;
    }
    map.set(monthKey, existing);
  }

  return Array.from(map.entries())
    .map(([month, data]) => {
      const [y, m] = month.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1);
      return {
        month,
        label: date.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' }),
        expense: Math.round(data.expense),
        income: Math.round(data.income),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}
