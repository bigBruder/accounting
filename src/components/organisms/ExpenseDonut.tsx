import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategoryBreakdown } from '../../services/budget.service';
import { formatAmount } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';
import type { FilterOptions } from '../../models/types';

interface ExpenseDonutProps {
  filters?: FilterOptions;
  activeCategoryId?: string;
  onCategoryClick?: (id: string) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip__label">
          {data.icon} {data.name}
        </div>
        <div className="chart-tooltip__value">
          {formatAmount(data.value)} ({data.percentage.toFixed(1)}%)
        </div>
      </div>
    );
  }
  return null;
};

export const ExpenseDonut: React.FC<ExpenseDonutProps> = ({ filters = {}, activeCategoryId, onCategoryClick }) => {
  const { transactions, categories } = useData();
  const items = getCategoryBreakdown(transactions, categories, 'expense', filters);

  if (items.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="section-title">Структура витрат</h3>
        <div className="chart-empty">
          <span className="chart-empty__icon">🍩</span>
          <span className="chart-empty__text">Додайте витрати для діаграми</span>
        </div>
      </div>
    );
  }

  const chartData = items.map(item => ({
    name: item.category.name,
    value: Math.round(item.total),
    color: item.category.color,
    icon: item.category.icon,
    percentage: item.percentage,
    id: item.category.id,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="chart-card">
      <h3 className="section-title">Структура витрат</h3>
      <div className="donut-chart-container">
        <div className="donut-chart">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                onClick={(_, index) => onCategoryClick?.(chartData[index].id)}
                style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={entry.color}
                    opacity={activeCategoryId && activeCategoryId !== entry.id ? 0.3 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-chart__center">
            <div className="donut-chart__total">{formatAmount(total)}</div>
            <div className="donut-chart__label">Всього</div>
          </div>
        </div>
        <div className="donut-legend">
          {chartData.map((item) => (
            <div
              key={item.id}
              className={`donut-legend__item ${activeCategoryId === item.id ? 'donut-legend__item--active' : ''}`}
              onClick={() => onCategoryClick?.(item.id)}
              style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
            >
              <span className="donut-legend__dot" style={{ background: item.color }}></span>
              <span className="donut-legend__name">{item.icon} {item.name}</span>
              <span className="donut-legend__value">{formatAmount(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
