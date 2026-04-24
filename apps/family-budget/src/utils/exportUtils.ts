import { type Transaction, type Category } from '../models/types';

export const exportToCSV = (transactions: Transaction[], categories: Category[] = []) => {
  if (transactions.length === 0) return;

  const headers = ['Дата', 'Тип', 'Сума', 'Валюта', 'Категорія', 'Опис', 'Автор'];
  
  const rows = transactions.map(t => {
    const category = categories.find(c => c.id === t.categoryId)?.name || t.categoryId;
    const typeLabel = t.type === 'income' ? 'Дохід' : t.type === 'expense' ? 'Витрата' : 'Переказ';
    
    return [
      t.date,
      typeLabel,
      t.amount.toFixed(2),
      'UAH',
      category,
      t.description.replace(/,/g, ' '), // safety from CSV break
      t.createdByName || t.createdBy || 'Система'
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for Excel UTF-8 support
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `family_budget_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
