import PropTypes from 'prop-types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * CategoryDonutChart
 *
 * Renders a Recharts PieChart in donut style (innerRadius > 0) to show
 * expense breakdown by category. It receives already-computed data from
 * the parent (Summary.jsx's `expenseByCategory` useMemo) — we intentionally
 * do NOT re-derive it here to avoid duplicating the calculation.
 *
 * Recharts data shape requirement:
 *   Each entry must have a `name` and a numeric `value` field.
 *   We map `amount` → `value` because that's the key Recharts Pie reads
 *   for slice sizing.
 *
 * @param {{ data: Array, colors: string[] }} props
 */

// Custom tooltip shown when hovering a slice
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-bold text-slate-900 dark:text-slate-100 mb-0.5">
          {entry.name}
        </p>
        <p className="font-semibold tabular-nums" style={{ color: entry.payload.fill }}>
          {formatCurrency(entry.value)}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          {entry.payload.percentage.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

export default function CategoryDonutChart({ data, colors }) {
  // --- Empty state ---
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <PieIcon size={28} className="text-slate-400 dark:text-slate-500 opacity-50" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center">
          Add an expense to see your category breakdown
        </p>
      </div>
    );
  }

  // Map `amount` to `value` so Recharts Pie knows which field drives slice size.
  // We keep all original fields (name, percentage) for the tooltip.
  const pieData = data.map((d) => ({ ...d, value: d.amount }));

  return (
    <div className="w-full" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            // cx/cy default to center; innerRadius creates the donut hole
            cx="50%"
            cy="50%"
            innerRadius="52%"   // donut hole — ~52% of the radius
            outerRadius="80%"   // slice outer edge
            paddingAngle={3}    // small gap between slices for clarity
            dataKey="value"
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={600}
          >
            {/* Each slice gets a color from the shared palette */}
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={colors[index % colors.length]}
                stroke="transparent" // no border between slices
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

CategoryDonutChart.propTypes = {
  /** Pre-computed category breakdown from Summary's expenseByCategory useMemo */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired,
    })
  ).isRequired,
  /** Ordered array of hex color strings, one per category (wraps around) */
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};
