export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string; // ISO date string
  createdAt: number;
  externalId?: string; // ID from external source (like Monobank)
  createdBy?: string;  // User UID
  createdByName?: string; // User Name or Email
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  createdBy?: string;
  createdByName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface FilterOptions {
  type?: TransactionType | 'all';
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Зарплата', icon: '💰', color: '#4ade80', type: 'income' },
  { id: 'freelance', name: 'Фріланс', icon: '💻', color: '#60a5fa', type: 'income' },
  { id: 'gift', name: 'Подарунки', icon: '🎁', color: '#f472b6', type: 'income' },
  { id: 'other-income', name: 'Інше', icon: '📥', color: '#a78bfa', type: 'income' },
  { id: 'food', name: 'Їжа', icon: '🍕', color: '#fb923c', type: 'expense' },
  { id: 'transport', name: 'Транспорт', icon: '🚗', color: '#38bdf8', type: 'expense' },
  { id: 'housing', name: 'Житло', icon: '🏠', color: '#a78bfa', type: 'expense' },
  { id: 'entertainment', name: 'Розваги', icon: '🎮', color: '#fb7185', type: 'expense' },
  { id: 'health', name: 'Здоров\'я', icon: '💊', color: '#34d399', type: 'expense' },
  { id: 'shopping', name: 'Покупки', icon: '🛍️', color: '#fbbf24', type: 'expense' },
  { id: 'utilities', name: 'Комунальні', icon: '💡', color: '#f97316', type: 'expense' },
  { id: 'education', name: 'Освіта', icon: '📚', color: '#818cf8', type: 'expense' },
  { id: 'other-expense', name: 'Інше', icon: '📤', color: '#94a3b8', type: 'expense' },
];
