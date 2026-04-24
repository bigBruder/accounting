import React from 'react';
import type { TransactionType } from '../../models/types';

interface BadgeProps {
  text: string;
  type: TransactionType;
}

export const Badge: React.FC<BadgeProps> = ({ text, type }) => {
  return <span className={`badge badge--${type}`}>{text}</span>;
}
