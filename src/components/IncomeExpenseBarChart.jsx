import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * IncomeExpenseBarChart
 *
 * A grouped BarChart comparing total income vs total expenses per calendar
 * month. This gives a temporal view of cash flow that complements the
 * donut chart's category breakdown.
 *
 * Data derivation (useMemo):
 *   We group all transactions by "YYYY-MM" month key, then accumulate
 *   income and expense totals per group. The result is sorted chronologically.
 *   This is memoized because the grouping is O(n) and should not re-run
 *   on every parent render triggered by unrelated state (e.g. an accordion
 *   open/close in Summary.jsx).
 *
 * Recharts data shape:
 *   Each entry is { month: "Sep 2026", income: number, expense: number }.
 *   `month` maps to XAxis dataKey; `income` and `expense` each map to a Bar.
 *
 * @param {{ transactions: Array }} props
 */

// Custom tooltip for dark-mode-safe styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-lg text-sm space-y-1.5">
        <p className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wide mb-2">
          {label}
        </p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-slate-600 dark:text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

// Custom legend renderer that matches the app's typography
const CustomLegend = ({ payload }) => (
  <div className="flex items-center justify-center gap-6 pt-2">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 capitalize">
          {entry.value}
        </span>
      </div>
    ))}
  </div>
);

CustomLegend.propTypes = {
  payload: PropTypes.array,
};

export default function IncomeExpenseBarChart({ transactions }) {
  // --- Derive monthly income/expense totals ---
  // useMemo: skip re-computation when Summary's unrelated state (e.g.
  // accordion open state) changes — only recompute when transactions change.
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    // Accumulate totals per YYYY-MM key
    const monthMap = {};
    transactions.forEach((t) => {
      // t.date is "YYYY-MM-DD"; slice(0,7) gives "YYYY-MM"
      const monthKey = t.date.slice(0, 7);
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { monthKey, income: 0, expense: 0 };
      }
      if (t.type === 'Income') {
        monthMap[monthKey].income += t.amount;
      } else {
        monthMap[monthKey].expense += t.amount;
      }
    });

    // Sort chronologically by "YYYY-MM" key (ISO strings sort naturally)
    return Object.values(monthMap)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map(({ monthKey, income, expense }) => {
        const [year, month] = monthKey.split('-');
        const dateObj = new Date(year, parseInt(month) - 1, 1);
        return {
          // Format the display label: "Sep 2026"
          month: dateObj.toLocaleDateString('en-PH', {
            month: 'short',
            year: 'numeric',
          }),
          income,
          expense,
        };
      });
  }, [transactions]); // only recalculate when transaction list changes

  // --- Empty state ---
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <BarChart2 size={28} className="text-slate-400 dark:text-slate-500 opacity-50" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center">
          Add a transaction to see your monthly comparison
        </p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          barCategoryGap="30%"  // gap between month groups
          barGap={4}            // gap between bars in the same group
        >
          {/*
           * CartesianGrid: only horizontal lines, slate color for dark-mode safety.
           * strokeDasharray="3 3" gives a subtle dashed look.
           */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"   // slate-700, visible in both modes
            vertical={false}   // only horizontal guide lines
          />

          {/*
           * XAxis: the month label. Slate-500 (#64748b) is neutral enough
           * for both light and dark mode without any green tint.
           */}
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />

          {/*
           * YAxis: tick formatter shows abbreviated PHP amounts.
           * We abbreviate large numbers (1000 → 1K) for readability.
           */}
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              value >= 1000 ? `₱${(value / 1000).toFixed(1)}K` : `₱${value}`
            }
            width={56}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,116,139,0.08)' }} />
          <Legend content={<CustomLegend />} />

          {/* Income bar — emerald-500 */}
          <Bar
            dataKey="income"
            fill="#10b981"
            radius={[4, 4, 0, 0]}   // rounded top corners
            maxBarSize={40}
            isAnimationActive={true}
            animationDuration={600}
          />

          {/* Expense bar — rose-500 */}
          <Bar
            dataKey="expense"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            isAnimationActive={true}
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

IncomeExpenseBarChart.propTypes = {
  /** The full array of transaction objects from useTransactions */
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['Income', 'Expense']).isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
};
