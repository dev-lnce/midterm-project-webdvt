import { useMemo, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import CategoryDonutChart from '../components/CategoryDonutChart';
import IncomeExpenseBarChart from '../components/IncomeExpenseBarChart';
import { PieChart, ListFilter, ChevronDown, ArrowDownRight, BarChart2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Hex color palette shared between the donut chart (Recharts Cell fill prop)
 * and the category dot indicators in the bar list. Using hex values here
 * because Recharts SVG props cannot consume Tailwind class names.
 *
 * Order mirrors the original Tailwind color order from the old colors array:
 *   emerald → teal → cyan → indigo → rose → amber
 */
const CATEGORY_COLORS = [
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
  '#f43f5e', // rose-500
  '#f59e0b', // amber-500
];

export default function Summary() {
  const { transactions } = useTransactions();

  // Tracks which category names are expanded in the accordion.
  // Using a Set allows O(1) lookups.
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  // --- Expense breakdown by category ---
  // This is the SAME useMemo as before — NOT duplicated in the chart component.
  // The computed `expenseByCategory` array is passed down as a prop to
  // CategoryDonutChart so it can reuse it without re-deriving.
  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categories = expenses.reduce((acc, curr) => {
      if (acc[curr.category]) {
        acc[curr.category] += curr.amount;
      } else {
        acc[curr.category] = curr.amount;
      }
      return acc;
    }, {});

    return Object.entries(categories)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Pre-bucket transactions by category for the accordion rows.
  // We derive this alongside expenseByCategory to keep the useMemo deps
  // consistent — both depend only on [transactions].
  const transactionsByCategory = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'Expense').forEach(t => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    // Sort each bucket newest-first for readability
    Object.values(map).forEach(arr => arr.sort((a, b) => b.date.localeCompare(a.date)));
    return map;
  }, [transactions]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">

      <div className="w-full flex flex-col items-start text-left mb-2 md:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <PieChart size={28} className="text-emerald-600 dark:text-emerald-500" />
          Spending Summary
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-lg w-full">
          Your expenses broken down by category. See where your money is going to better manage your budget.
        </p>
      </div>

      {/* ── Expense Breakdown Card (Donut + Accordion list) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">

        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 relative z-10">
          <ListFilter size={20} className="text-slate-400 dark:text-slate-500" />
          Expense Breakdown
        </h3>

        {expenseByCategory.length > 0 ? (
          <div className="relative z-10">
            {/*
             * Two-column layout on md+: donut chart on the left,
             * category bar list on the right. Stacked vertically on mobile.
             */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">

              {/* ─ Donut Chart ─ */}
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">By Category</p>
                {/*
                 * We pass `expenseByCategory` directly — no re-derivation.
                 * CategoryDonutChart maps `amount` → `value` internally for Recharts.
                 */}
                <CategoryDonutChart data={expenseByCategory} colors={CATEGORY_COLORS} />
              </div>

              {/* ─ Category Bar List ─ */}
              <div className="space-y-5">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Breakdown</p>
                {expenseByCategory.map((category, index) => {
                  const hexColor = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                  const isOpen = expandedCategories.has(category.name);
                  const categoryTxns = transactionsByCategory[category.name] || [];

                  return (
                    <div key={category.name}>
                      {/*
                       * Each category row is a <button> for keyboard accessibility.
                       * aria-expanded reflects the open/closed state so screen readers
                       * can announce whether child content is visible.
                       */}
                      <button
                        onClick={() => toggleCategory(category.name)}
                        aria-expanded={isOpen}
                        className="w-full group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-lg"
                      >
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            {/* Colored dot using inline hex — matches the donut chart slice */}
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                              style={{ backgroundColor: hexColor }}
                            />
                            {category.name}
                          </span>
                          <div className="flex items-center gap-2 text-right">
                            <div>
                              <span className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                                {formatCurrency(category.amount)}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 text-xs ml-1.5 tabular-nums font-semibold">
                                ({category.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            {/* Chevron rotates 180° when expanded */}
                            <ChevronDown
                              size={16}
                              className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                            style={{ width: `${category.percentage}%`, backgroundColor: hexColor }}
                          />
                        </div>
                      </button>

                      {/* ─ Accordion content: individual transactions ─ */}
                      {isOpen && (
                        <div className="mt-3 ml-6 space-y-2 border-l-2 pl-4" style={{ borderColor: hexColor + '40' }}>
                          {categoryTxns.map(t => {
                            const formattedDate = new Date(t.date).toLocaleDateString('en-PH', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            });
                            return (
                              <div
                                key={t.id}
                                className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 group/item"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Mini icon — mirrors TransactionItem's visual language */}
                                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
                                    <ArrowDownRight size={14} strokeWidth={2.5} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{t.description}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200 shrink-0 ml-3">
                                  -{formatCurrency(t.amount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 sm:py-16 w-full max-w-md mx-auto text-center flex flex-col items-center justify-center relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 sm:mb-6">
              <PieChart size={32} className="text-slate-400 dark:text-slate-500 opacity-50" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No expenses recorded</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium w-full">Add some expenses to see your spending breakdown.</p>
          </div>
        )}
      </div>

      {/* ── Income vs Expenses Bar Chart Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">

        <div className="absolute left-0 bottom-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2 relative z-10">
          <BarChart2 size={20} className="text-slate-400 dark:text-slate-500" />
          Income vs Expenses
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 relative z-10">
          Monthly comparison of income earned and expenses spent.
        </p>

        <div className="relative z-10">
          {/*
           * IncomeExpenseBarChart derives its own monthly grouping via useMemo.
           * We pass the full transactions list and let it handle aggregation —
           * the chart has different data needs (monthly totals for both income
           * AND expense) vs. expenseByCategory (expense only, by category).
           */}
          <IncomeExpenseBarChart transactions={transactions} />
        </div>
      </div>

    </div>
  );
}
