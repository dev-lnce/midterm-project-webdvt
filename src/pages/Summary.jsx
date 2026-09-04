import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import CategoryDonutChart from '../components/CategoryDonutChart';
import IncomeExpenseBarChart from '../components/IncomeExpenseBarChart';
import { PieChart, ListFilter, ChevronDown, ArrowDownRight, BarChart2, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Hex color palette shared between the donut chart (Recharts Cell fill prop)
 * and the category dot indicators in the bar list.
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
  const navigate = useNavigate();

  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [timeframe, setTimeframe] = useState('monthly');
  const [breakdownFilter, setBreakdownFilter] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'

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

  const filteredExpenses = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    const today = new Date(currentYear, currentMonth, currentDay);
    const sevenDaysAgo = new Date(currentYear, currentMonth, currentDay - 6);

    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    return expenses.filter(t => {
      if (!t.date) return false;
      const [y, m, d] = t.date.split('-').map(Number);
      const tDate = new Date(y, m - 1, d);

      if (breakdownFilter === 'daily') {
        return t.date === todayStr;
      } else if (breakdownFilter === 'weekly') {
        return tDate >= sevenDaysAgo && tDate <= today;
      } else if (breakdownFilter === 'monthly') {
        return t.date.startsWith(currentMonthStr);
      }
      return true;
    });
  }, [transactions, breakdownFilter]);

  const expenseByCategory = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    const categories = filteredExpenses.reduce((acc, curr) => {
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
  }, [filteredExpenses]);

  const transactionsByCategory = useMemo(() => {
    const map = {};
    filteredExpenses.forEach(t => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    Object.values(map).forEach(arr => arr.sort((a, b) => b.date.localeCompare(a.date)));
    return map;
  }, [filteredExpenses]);

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

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">

        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 relative z-10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ListFilter size={20} className="text-slate-400 dark:text-slate-500" />
            Expense Breakdown
          </h3>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
            {['daily', 'weekly', 'monthly'].map((filter) => (
              <button
                key={filter}
                onClick={() => setBreakdownFilter(filter)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                  breakdownFilter === filter
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {expenseByCategory.length > 0 ? (
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">

              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">By Category</p>
                <CategoryDonutChart data={expenseByCategory} colors={CATEGORY_COLORS} />
              </div>

              <div className="space-y-5">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Breakdown</p>
                {expenseByCategory.map((category, index) => {
                  const hexColor = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                  const isOpen = expandedCategories.has(category.name);
                  const categoryTxns = transactionsByCategory[category.name] || [];

                  return (
                    <div key={category.name}>
                      <button
                        onClick={() => toggleCategory(category.name)}
                        aria-expanded={isOpen}
                        className="w-full group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-lg"
                      >
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
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
                            <ChevronDown
                              size={16}
                              className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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

                      {/* Smooth accordion content */}
                      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <div className="ml-6 space-y-2 border-l-2 pl-4 py-1" style={{ borderColor: hexColor + '40' }}>
                            {categoryTxns.map(t => {
                              const formattedDate = new Date(t.date).toLocaleDateString('en-PH', {
                                month: 'short', day: 'numeric', year: 'numeric'
                              });
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => navigate(`/transaction/${t.id}`)}
                                  className="w-full text-left flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 group/item hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-[0.99]"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                                      <ArrowDownRight size={14} strokeWidth={2.5} />
                                    </div>
                                    <div className="min-w-0 pr-2">
                                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">{t.description}</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">
                                      -{formatCurrency(t.amount)}
                                    </span>
                                    <ChevronRight size={16} className="text-slate-400 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 duration-200" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
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
            <p className="text-slate-500 dark:text-slate-400 font-medium w-full">
              {breakdownFilter === 'daily'
                ? 'No expenses recorded for today.'
                : breakdownFilter === 'weekly'
                ? 'No expenses recorded for the past 7 days.'
                : 'No expenses recorded for this month.'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">

        <div className="absolute left-0 bottom-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <BarChart2 size={20} className="text-slate-400 dark:text-slate-500" />
              Income vs Expenses
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Comparison of income earned and expenses spent over time.
            </p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
            {['daily', 'weekly', 'monthly'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${timeframe === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <IncomeExpenseBarChart transactions={transactions} timeframe={timeframe} />
        </div>
      </div>

    </div>
  );
}
