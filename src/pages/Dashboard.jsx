import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionItem from '../components/TransactionItem';
import BalanceTrendChart from '../components/BalanceTrendChart';
import CategoryDonutChart from '../components/CategoryDonutChart';
import IncomeExpenseBarChart from '../components/IncomeExpenseBarChart';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownRight, Receipt, SearchX, Plus, PieChart, BarChart2, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const CATEGORY_COLORS = [
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
  '#f43f5e', // rose-500
  '#f59e0b', // amber-500
];

export default function Dashboard() {
  const { transactions } = useTransactions();
  const [filterType, setFilterType] = useState('All'); // 'All', 'Income', 'Expense'
  const [activeView, setActiveView] = useState('donut'); // 'donut' or 'bar'

  const { totalIncome, totalExpense, currentBalance, filteredTransactions, vsLastMonth, topCategory } = useMemo(() => {
    let income = 0;
    let expense = 0;

    // Stats for comparison
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let currentMonthExpense = 0;
    let lastMonthExpense = 0;
    const categoryTotals = {};

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      const isLastMonth = tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;

      if (t.type === 'Income') {
        income += t.amount;
      } else {
        expense += t.amount;

        // Month-over-month calculation and top category
        if (isCurrentMonth) {
          currentMonthExpense += t.amount;
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        } else if (isLastMonth) {
          lastMonthExpense += t.amount;
        }
      }
    });

    const filtered = transactions.filter(t => {
      if (filterType === 'All') return true;
      return t.type === filterType;
    });

    // Calculate percentage change vs last month. If last month was 0, it's not very helpful to say +Infinity%
    let vsLastMonthText = "No data from last month";
    let vsLastMonthColor = "text-slate-200/70";
    if (lastMonthExpense > 0) {
      const diff = currentMonthExpense - lastMonthExpense;
      const pct = (diff / lastMonthExpense) * 100;
      if (pct > 0) {
        vsLastMonthText = `+${pct.toFixed(1)}% vs last month`;
        vsLastMonthColor = "text-rose-400"; // Higher expense is "decline" in context of budget
      } else {
        vsLastMonthText = `${pct.toFixed(1)}% vs last month`;
        vsLastMonthColor = "text-emerald-400"; // Lower expense is "improvement"
      }
    } else if (currentMonthExpense > 0 && lastMonthExpense === 0) {
      vsLastMonthText = "+100% vs last month";
      vsLastMonthColor = "text-rose-400";
    }

    // Top Category
    let topCat = "None";
    let maxAmt = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt;
        topCat = cat;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      currentBalance: income - expense,
      filteredTransactions: filtered,
      vsLastMonth: { text: vsLastMonthText, color: vsLastMonthColor },
      topCategory: `Top category: ${topCat}`
    };
  }, [transactions, filterType]);

  const topExpenses = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const totals = {};
    let totalExp = 0;
    expenses.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
      totalExp += t.amount;
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount, percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const topCategories = useMemo(() => {
    return topExpenses.slice(0, 3).map((cat) => ({
      ...cat,
      percentage: Math.round(cat.percentage),
    }));
  }, [topExpenses]);

  return (
    <div className="w-full space-y-8">

      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Balance Hero Card */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg group flex flex-col justify-between h-full">
          {/* Abstract Background Elements */}
          <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out"></div>
          <div className="absolute right-6 bottom-6 sm:right-12 sm:bottom-12 opacity-10 pointer-events-none">
            <Wallet size={100} strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-emerald-300" />
                <p className="text-sm font-semibold text-emerald-100/80 uppercase tracking-wider">Current Balance</p>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white tabular-nums tracking-tight mb-2">
                {formatCurrency(currentBalance)}
              </h2>

              {/* Derived stats */}
              <div className="sm:h-6 mb-4 flex items-center gap-4 text-xs font-semibold">
                <span className={`${vsLastMonth.color}`}>{vsLastMonth.text}</span>
                <span className="text-white/80 border-l border-white/20 pl-4">{topCategory}</span>
              </div>

              <div className="opacity-30 mb-4 hidden sm:block relative z-20">
                <BalanceTrendChart transactions={transactions} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-200/70 mb-0.5">Total Income</p>
                  <p className="text-lg font-bold text-white tabular-nums tracking-tight">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                  <ArrowDownRight size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-rose-200/70 mb-0.5">Total Expenses</p>
                  <p className="text-lg font-bold text-white tabular-nums tracking-tight">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Carousel Card (Top Spending / Cash Flow Toggle) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full min-h-[440px]">
          {/* Header Structure */}
          <div className="flex items-center justify-between w-full pb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 whitespace-nowrap">
                {activeView === 'donut' ? (
                  <>
                    <PieChart size={20} className="text-emerald-500 shrink-0" />
                    <span>Top Spending</span>
                  </>
                ) : (
                  <>
                    <BarChart2 size={20} className="text-emerald-500 shrink-0" />
                    <span>Cash Flow</span>
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium whitespace-nowrap">
                {activeView === 'donut' ? 'Largest outflow this period' : 'Income vs Expenses'}
              </p>
            </div>

            {/* Right Side (Navigation Arrows) */}
            {activeView === 'donut' ? (
              <button
                type="button"
                onClick={() => setActiveView('bar')}
                aria-label="Switch to Cash Flow"
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-[#328B56] transition-all active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView('donut')}
                aria-label="Switch to Top Spending"
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-[#328B56] transition-all active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {/* Carousel Body (Cross-fade between Slide 0 and Slide 1) */}
          <div className="flex-1 relative w-full min-h-[310px] my-1">
            {/* Slide 0: Top Spending */}
            <div
              className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ease-in-out ${
                activeView === 'donut' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Center Donut Chart */}
              <div className="w-36 h-36 mx-auto my-1 flex items-center justify-center shrink-0">
                <CategoryDonutChart data={topExpenses} colors={CATEGORY_COLORS} height="100%" />
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center items-center gap-2 my-2">
                <span className="w-5 h-1.5 bg-emerald-500 rounded-full transition-all duration-300" />
                <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full transition-all duration-300" />
              </div>

              {/* Category Progress Bars */}
              {topCategories.length > 0 ? (
                <div className="space-y-2 w-full pb-1">
                  {topCategories.map((cat) => (
                    <div key={cat.name} className="w-full space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {cat.name} <span className="text-slate-400 font-normal">- ₱{cat.amount.toLocaleString()}</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{cat.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-slate-400">
                  No expense recorded yet
                </div>
              )}
            </div>

            {/* Slide 1: Cash Flow */}
            <div
              className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ease-in-out ${
                activeView === 'bar' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Centered, Maximized Bar Chart */}
              <div className="w-full h-[250px]">
                <IncomeExpenseBarChart
                  transactions={transactions}
                  hideLegend={true}
                  height="100%"
                  margin={{ top: 6, right: 2, left: 0, bottom: 0 }}
                  yAxisWidth={45}
                  maxBarSize={48}
                  barGap={6}
                />
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center items-center gap-2 my-1 shrink-0">
                <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full transition-all duration-300" />
                <span className="w-5 h-1.5 bg-emerald-500 rounded-full transition-all duration-300" />
              </div>

              {/* Financial Metric Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center w-full shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-medium text-slate-400 mb-0.5">Income</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    +{formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-medium text-slate-400 mb-0.5">Expense</span>
                  <span className="text-xs font-bold text-rose-500 whitespace-nowrap">
                    -{formatCurrency(totalExpense)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-medium text-slate-400 mb-0.5">Net</span>
                  <span className={`text-xs font-bold whitespace-nowrap ${totalIncome - totalExpense >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                    {totalIncome - totalExpense >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalIncome - totalExpense))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer ("View Full Summary") */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center w-full">
            <Link className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1" to="/summary">
              <span>View Full Summary</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt size={24} className="text-emerald-600 dark:text-emerald-500" />
            Recent Transactions
          </h3>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Income', 'Expense'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out ${filterType === type
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="p-10 sm:p-16 w-full max-w-md mx-auto text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 sm:mb-6">
                  <SearchX size={32} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No transactions found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 font-medium">
                  {filterType === 'All'
                    ? "You haven't recorded any transactions yet. Get started by adding your first one."
                    : `You have no ${filterType.toLowerCase()}s matching this filter.`}
                </p>

                {filterType !== 'All' ? (
                  <button
                    onClick={() => setFilterType('All')}
                    className="px-6 py-2.5 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200 ease-out dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 active:scale-[0.98]"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to="/add"
                    className="px-6 sm:px-8 py-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 ease-out shadow-sm shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    Add Transaction
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
