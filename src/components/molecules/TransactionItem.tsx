import React from 'react';
import { Icon } from '../atoms/Icon';
import { formatAmount, formatDate } from '../../utils/formatters';
import type { Transaction, Category } from '../../models/types';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onDelete?: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, category, onDelete }) => {
  const isExpense = transaction.type === 'expense';
  
  return (
    <div className="transaction-item animate-slide-in">
      <div className="transaction-item__icon" style={{ background: `${category?.color || '#ccc'}20`, color: category?.color || '#ccc' }}>
        {category?.icon || '💰'}
      </div>
      <div className="transaction-item__info">
        <div className="transaction-item__title">{transaction.description}</div>
        <div className="transaction-item__meta">
          <span className="transaction-item__category">{category?.name || 'Unknown'}</span>
          <span className="transaction-item__date">{formatDate(transaction.date)}</span>
          {transaction.createdByName && (
            <span className="transaction-item__author" title={`Додав: ${transaction.createdByName}`}>
              👤 {transaction.createdByName}
            </span>
          )}
        </div>
      </div>
      <div className={`transaction-item__amount transaction-item__amount--${transaction.type}`}>
        {isExpense ? '−' : '+'}{formatAmount(transaction.amount)}
      </div>
      {onDelete && (
        <button 
          className="transaction-item__delete" 
          onClick={() => onDelete(transaction.id)}
          title="Видалити"
        >
          <Icon name="trash" />
        </button>
      )}
    </div>
  );
};
