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
 * @param {{ transactions: Array, timeframe?: string, hideLegend?: boolean, height?: number | string }} props
 */

const getStartOfWeek = (dateString) => {
  const d = new Date(dateString);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  const yyyy = start.getFullYear();
  const mm = String(start.getMonth() + 1).padStart(2, '0');
  const dd = String(start.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

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

export default function IncomeExpenseBarChart({
  transactions,
  hideLegend = false,
  height = 260,
  timeframe = 'monthly',
  margin = { top: 4, right: 8, left: 8, bottom: 4 },
  yAxisWidth = 56,
  maxBarSize = 40,
  barGap = 4,
}) {
  // --- Derive income/expense totals based on timeframe ---
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    const map = {};
    transactions.forEach((t) => {
      let key;
      if (timeframe === 'daily') {
        key = t.date; // YYYY-MM-DD
      } else if (timeframe === 'weekly') {
        key = getStartOfWeek(t.date);
      } else {
        key = t.date.slice(0, 7); // YYYY-MM
      }

      if (!map[key]) {
        map[key] = { key, income: 0, expense: 0 };
      }
      if (t.type === 'Income') {
        map[key].income += t.amount;
      } else {
        map[key].expense += t.amount;
      }
    });

    return Object.values(map)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(({ key, income, expense }) => {
        let label = '';
        if (timeframe === 'daily') {
          const [y, m, d] = key.split('-');
          const dateObj = new Date(y, parseInt(m) - 1, d);
          label = dateObj.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
        } else if (timeframe === 'weekly') {
          const [y, m, d] = key.split('-');
          const dateObj = new Date(y, parseInt(m) - 1, d);
          label = 'Wk of ' + dateObj.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
        } else {
          const [y, m] = key.split('-');
          const dateObj = new Date(y, parseInt(m) - 1, 1);
          label = dateObj.toLocaleDateString('en-PH', { month: 'short', year: 'numeric' });
        }

        return {
          month: label,
          income,
          expense,
        };
      });
  }, [transactions, timeframe]);

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
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={margin}
          barCategoryGap="25%"
          barGap={barGap}
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
            tickFormatter={(value) => {
              if (value === 0) return '₱0';
              if (value >= 1000) {
                const k = value / 1000;
                return k % 1 === 0 ? `₱${k}K` : `₱${k.toFixed(1)}K`;
              }
              return `₱${value}`;
            }}
            width={yAxisWidth}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,116,139,0.08)' }} />
          {!hideLegend && <Legend content={<CustomLegend />} />}

          {/* Income bar — emerald-500 */}
          <Bar
            dataKey="income"
            fill="#10b981"
            radius={[4, 4, 0, 0]}   // rounded top corners
            maxBarSize={maxBarSize}
            isAnimationActive={true}
            animationDuration={600}
          />

          {/* Expense bar — rose-500 */}
          <Bar
            dataKey="expense"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
            maxBarSize={maxBarSize}
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
