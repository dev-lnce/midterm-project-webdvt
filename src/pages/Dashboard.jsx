import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionItem from '../components/TransactionItem';
import CategoryDonutChart from '../components/CategoryDonutChart';
import IncomeExpenseBarChart from '../components/IncomeExpenseBarChart';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownRight, Receipt, SearchX, PieChart, BarChart2, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
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
  const [showBalance, setShowBalance] = useState(true);
  const [balancePeriod, setBalancePeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

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
      topCategory: topCat
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

  const balanceStr = currentBalance < 0
    ? `-${formatCurrency(Math.abs(currentBalance))}`
    : formatCurrency(currentBalance);

  const displayBalance = showBalance ? balanceStr : "₱ • • • • • •";

  const balanceFontSize = balanceStr.length > 15 
    ? "text-2xl sm:text-3xl" 
    : balanceStr.length > 11 
    ? "text-3xl sm:text-4xl" 
    : "text-4xl sm:text-5xl";

  const sparklineData = useMemo(() => {
    const today = new Date();
    let points = [];
    let periodLabels = [];

    if (balancePeriod === 'daily') {
      periodLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        let bal = 0;
        for (const t of transactions) {
          if (t.date <= dateStr) {
            bal += t.type === 'Income' ? t.amount : -t.amount;
          }
        }
        points.push(bal);
      }
    } else if (balancePeriod === 'weekly') {
      periodLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      for (let i = 3; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i * 7);
        const dateStr = d.toISOString().split('T')[0];
        let bal = 0;
        for (const t of transactions) {
          if (t.date <= dateStr) {
            bal += t.type === 'Income' ? t.amount : -t.amount;
          }
        }
        points.push(bal);
      }
    } else {
      // monthly
      periodLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      for (let i = 5; i >= 0; i--) {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        const dateStr = endOfMonth.toISOString().split('T')[0];
        let bal = 0;
        for (const t of transactions) {
          if (t.date <= dateStr) {
            bal += t.type === 'Income' ? t.amount : -t.amount;
          }
        }
        points.push(bal);
      }
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 300;
    const height = 60;
    const padding = 6;
    const numPoints = points.length;

    const coords = points.map((val, idx) => {
      const x = (idx / (numPoints - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return { x, y };
    });

    const pathD = coords.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      const prev = arr[idx - 1];
      const cx1 = (prev.x + pt.x) / 2;
      const cy1 = prev.y;
      const cx2 = (prev.x + pt.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }, '');

    const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

    return { pathD, areaD, labels: periodLabels, width, height };
  }, [transactions, balancePeriod]);

  return (
    <div className="w-full space-y-8">

      {/* Bento Grid Top Section (7:5 Ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        {/* Current Balance Hero Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg group h-full min-h-[420px]">
          {/* Abstract Background Elements */}
          <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out"></div>
          <div className="absolute right-6 bottom-6 sm:right-12 sm:bottom-12 opacity-10 pointer-events-none">
            <Wallet size={100} strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between w-full mb-3">
                {/* Left: Label + Eye Privacy Toggle */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-100/80">
                    <Wallet className="w-4 h-4"/>
                    Current Balance
                  </span>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-emerald-200/70 hover:text-white transition-colors p-0.5"
                    title="Toggle balance visibility"
                  >
                    {showBalance ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
                  </button>
                </div>

                {/* Right: Daily / Weekly / Monthly Filter Pills */}
                <div className="flex items-center gap-0.5 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10">
                  {['daily', 'weekly', 'monthly'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setBalancePeriod(period)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                        balancePeriod === period
                          ? 'bg-white text-emerald-950 font-bold shadow-sm'
                          : 'text-emerald-100/70 hover:text-white'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <h2
                className={`font-black tracking-tight text-white whitespace-nowrap tabular-nums truncate ${showBalance ? balanceFontSize : "text-3xl sm:text-4xl"} leading-tight mb-2`}
                title={showBalance ? balanceStr : "Balance hidden"}
              >
                {displayBalance}
              </h2>

              {/* Subtitle */}
              <p className="text-xs text-emerald-100/70 mb-4 font-medium">
                {vsLastMonth.text} | Top category: {topCategory || 'None'}
              </p>
            </div>

            {/* Middle Section: 7-Day Balance Trendline Sparkline */}
            <div className="h-20 w-full my-auto flex flex-col justify-center relative z-20">
              <svg viewBox={`0 0 ${sparklineData.width} ${sparklineData.height}`} className="w-full h-14 overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="balanceSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={sparklineData.areaD} fill="url(#balanceSparkGrad)" />
                <path d={sparklineData.pathD} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-[10px] text-emerald-200/50 flex justify-between px-1 mt-1 font-medium select-none">
                {sparklineData.labels.map(label => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>

            {/* Bottom Stat Row (Clean 2-Stat Layout) */}
            <div className="flex items-center gap-6 sm:gap-8 pt-4 z-10 border-t border-emerald-800/40 mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <ArrowUpRight className="w-5 h-5"/>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-emerald-100/70 uppercase tracking-wider">Total Income</p>
                  <p className="text-base sm:text-lg font-bold text-white whitespace-nowrap tabular-nums">+{formatCurrency(totalIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-rose-300">
                  <ArrowDownRight className="w-5 h-5"/>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-emerald-100/70 uppercase tracking-wider">Total Expenses</p>
                  <p className="text-base sm:text-lg font-bold text-white whitespace-nowrap tabular-nums">-{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Carousel Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full min-h-[420px]">
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium whitespace-nowrap">
                {activeView === 'donut' ? 'Largest outflow this period' : 'Income vs Expenses'}
              </p>
            </div>

            {/* Right Side (Navigation Arrows) */}
            {activeView === 'donut' ? (
              <button 
                onClick={() => setActiveView('bar')} 
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-[#328B56] transition-all active:scale-95"
                title="View Cash Flow"
              >
                <ChevronRight className="w-5 h-5"/>
              </button>
            ) : (
              <button 
                onClick={() => setActiveView('donut')} 
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-[#328B56] transition-all active:scale-95"
                title="View Top Spending"
              >
                <ChevronLeft className="w-5 h-5"/>
              </button>
            )}
          </div>

          {/* Carousel Body (Cross-fade between Slide 0 and Slide 1) */}
          <div className="flex-1 relative w-full min-h-[300px] my-1">
            {/* Slide 0: Top Spending */}
            <div
              className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ease-in-out ${
                activeView === 'donut' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Center Donut Chart */}
              <div className="w-40 h-40 mx-auto my-1 flex items-center justify-center shrink-0">
                <CategoryDonutChart data={topExpenses} colors={CATEGORY_COLORS} height="100%" />
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center items-center gap-2 mt-1 mb-2">
                <span className="w-5 h-1.5 bg-emerald-500 rounded-full transition-all duration-300" />
                <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full transition-all duration-300" />
              </div>

              {/* Category Progress Bars */}
              {topCategories.length > 0 ? (
                <div className="space-y-2.5 w-full pb-1">
                  {topCategories.map((cat) => (
                    <div key={cat.name} className="w-full space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium truncate mr-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{cat.name}</span>
                          <span className="text-slate-400 dark:text-slate-500 tabular-nums shrink-0">- ₱{cat.amount.toLocaleString()}</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums shrink-0">{cat.percentage}%</span>
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
              <div className="flex-1 w-full flex flex-col justify-center items-center my-1 min-h-[190px]">
                <div className="w-full h-48 sm:h-52">
                  <IncomeExpenseBarChart
                    transactions={transactions}
                    hideLegend={true}
                    height="100%"
                    margin={{ top: 10, right: 2, left: 0, bottom: 0 }}
                    yAxisWidth={45}
                    maxBarSize={48}
                    barGap={6}
                  />
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center items-center gap-2 mt-1 mb-2 shrink-0">
                <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full transition-all duration-300" />
                <span className="w-5 h-1.5 bg-emerald-500 rounded-full transition-all duration-300" />
              </div>

              {/* Financial Metric Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center w-full shrink-0">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 mb-0.5">Income</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">+{formatCurrency(totalIncome)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 mb-0.5">Expense</p>
                  <p className="text-xs font-bold text-rose-500 whitespace-nowrap tabular-nums">-{formatCurrency(totalExpense)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 mb-0.5">Net</p>
                  <p className={`text-xs font-bold whitespace-nowrap tabular-nums ${totalIncome - totalExpense >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                    {totalIncome - totalExpense >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalIncome - totalExpense))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer ("View Full Summary") */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center mt-1">
            <Link className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 inline-flex items-center gap-1" to="/summary">
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
