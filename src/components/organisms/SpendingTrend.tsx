import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { getDailySpending, getMonthlyComparison } from '../../services/budget.service';
import { formatAmount } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';
import type { FilterOptions } from '../../models/types';

interface SpendingTrendProps {
  filters?: FilterOptions;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip__label">{label}</div>
        {payload.map((item: any, i: number) => (
          <div key={i} className="chart-tooltip__row">
            <span className="chart-tooltip__dot" style={{ background: item.color }}></span>
            <span>{item.name === 'expense' ? 'Витрати' : 'Доходи'}:</span>
            <span className="chart-tooltip__value">{formatAmount(item.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const SpendingTrend: React.FC<SpendingTrendProps> = ({ filters = {} }) => {
  const { transactions } = useData();
  const [view, setView] = useState<'daily' | 'monthly'>('daily');

  const dailyData = getDailySpending(transactions, filters);
  const monthlyData = getMonthlyComparison(transactions);

  const hasData = view === 'daily' ? dailyData.length > 0 : monthlyData.length > 0;

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h3 className="section-title" style={{ marginBottom: 0 }}>Динаміка</h3>
        <div className="chart-tabs">
          <button
            className={`chart-tab ${view === 'daily' ? 'chart-tab--active' : ''}`}
            onClick={() => setView('daily')}
          >
            По днях
          </button>
          <button
            className={`chart-tab ${view === 'monthly' ? 'chart-tab--active' : ''}`}
            onClick={() => setView('monthly')}
          >
            По місяцях
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="chart-empty">
          <span className="chart-empty__icon">📈</span>
          <span className="chart-empty__text">Недостатньо даних для графіка</span>
        </div>
      ) : view === 'daily' ? (
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="label"
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                name="expense"
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                name="income"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="label"
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} name="income" />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
