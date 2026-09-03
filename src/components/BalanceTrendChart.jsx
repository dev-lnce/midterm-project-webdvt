import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * BalanceTrendChart
 *
 * A sparkline-style AreaChart rendered inside the Dashboard hero card.
 * It sits behind the balance number as ambient visual texture — hence
 * low opacity, no axes, no gridlines, no tick labels.
 *
 * Data derivation (useMemo):
 *   We sort transactions chronologically and compute a running cumulative
 *   balance (income adds, expense subtracts). This is memoized so it only
 *   recomputes when `transactions` changes — not on every parent re-render
 *   that might be triggered by, e.g., the filterType state changing.
 *
 * @param {{ transactions: Array }} props
 */
export default function BalanceTrendChart({ transactions }) {
  // --- Derive cumulative running balance points ---
  // useMemo is used here to avoid re-sorting and re-iterating the full
  // transactions array on every render. This computation is O(n log n)
  // due to the sort, so caching it is worthwhile.
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    // Sort a copy of the array chronologically (oldest first) by date string.
    // ISO 8601 date strings (YYYY-MM-DD) sort correctly as plain strings.
    const sorted = [...transactions].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Build cumulative balance: each point records the running total
    // after processing that transaction.
    let runningBalance = 0;
    return sorted.map((t) => {
      runningBalance += t.type === 'Income' ? t.amount : -t.amount;
      return {
        date: t.date,
        // 'balance' is the key Recharts reads for the Y-axis value
        balance: runningBalance,
      };
    });
  }, [transactions]); // only re-run when transactions array reference changes

  // --- Empty state ---
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[90px] flex items-center justify-center gap-2 opacity-40 pointer-events-none select-none">
        <TrendingUp size={16} className="text-emerald-200" />
        <span className="text-xs text-emerald-100 font-medium">
          Add a transaction to see your trend
        </span>
      </div>
    );
  }

  return (
    // The outer wrapper is absolutely positioned in Dashboard.jsx.
    // opacity-30 keeps it as subtle background texture so the balance
    // number stays the clear visual focus.
    <div className="w-full" style={{ height: 90 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          {/* Gradient fill: opaque emerald at top fading to transparent */}
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/*
           * Area component:
           *   - type="monotone"  → smooth curves between points
           *   - dot={false}      → no circles on data points (sparkline look)
           *   - activeDot={false}→ no highlight on hover (keeps it subtle)
           *   - strokeWidth={2}  → visible but not heavy line
           */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={false}
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

BalanceTrendChart.propTypes = {
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
