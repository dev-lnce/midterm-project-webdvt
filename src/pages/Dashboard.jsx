import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useSavingsGoal } from '../hooks/useSavingsGoal';
import TransactionItem from '../components/TransactionItem';
import BalanceTrendChart from '../components/BalanceTrendChart';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, Receipt, SearchX, Pencil, X, Save } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function Dashboard() {
  const { transactions } = useTransactions();
  const { goal, setSavingsGoal } = useSavingsGoal();
  const [filterType, setFilterType] = useState('All'); // 'All', 'Income', 'Expense'

  // --- Savings Goal edit state ---
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState({ goalName: '', targetAmount: '' });

  const openGoalEdit = () => {
    // Pre-populate the draft form with the current stored values
    setGoalDraft({ goalName: goal.goalName, targetAmount: goal.targetAmount });
    setIsEditingGoal(true);
  };

  const saveGoal = () => {
    const parsedAmount = Number(goalDraft.targetAmount);
    if (!goalDraft.goalName.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
    setSavingsGoal({ goalName: goalDraft.goalName.trim(), targetAmount: parsedAmount });
    setIsEditingGoal(false);
  };

  const cancelGoalEdit = () => {
    setIsEditingGoal(false);
  };

  const { totalIncome, totalExpense, currentBalance, filteredTransactions } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'Income') income += t.amount;
      else expense += t.amount;
    });

    const filtered = transactions.filter(t => {
      if (filterType === 'All') return true;
      return t.type === filterType;
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      currentBalance: income - expense,
      filteredTransactions: filtered
    };
  }, [transactions, filterType]);

  // The savings goal progress is the 10%-of-balance rule applied to targetAmount.
  // We cap the progress bar at 100% with Math.min.
  const savingsContribution = currentBalance > 0 ? currentBalance * 0.1 : 0;
  const goalProgress = goal.targetAmount > 0
    ? Math.min((savingsContribution / goal.targetAmount) * 100, 100)
    : 0;

  return (
    <div className="w-full space-y-8">

      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Balance Hero Card */}
        <div className="xl:col-span-2 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg group">

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
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white tabular-nums tracking-tight mb-4">
                {formatCurrency(currentBalance)}
              </h2>

              {/*
               * Balance Trend Sparkline
               * Positioned here between the balance number and the income/expense row.
               * The wrapper uses opacity-30 so it reads as ambient visual texture rather
               * than a data widget — the balance number remains the visual focus.
               */}
              <div className="opacity-30 pointer-events-none mb-4">
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

        {/* Savings Goal Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Savings Goal</h3>
                {/* Pencil icon — opens inline edit mode */}
                <button
                  onClick={openGoalEdit}
                  aria-label="Edit savings goal"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <Pencil size={13} />
                </button>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <PiggyBank size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {isEditingGoal ? (
              /* ---- Inline Edit Mode ---- */
              <div className="space-y-3 mb-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Goal Name</label>
                  <input
                    type="text"
                    value={goalDraft.goalName}
                    onChange={(e) => setGoalDraft(prev => ({ ...prev, goalName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 text-sm font-medium"
                    placeholder="e.g. Emergency Fund"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Target Amount (₱)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={goalDraft.targetAmount}
                    onChange={(e) => setGoalDraft(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 text-sm tabular-nums"
                    placeholder="10000"
                  />
                </div>
                {/* Save / Cancel — same pattern as TransactionDetail.jsx edit mode */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={cancelGoalEdit}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    onClick={saveGoal}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Save size={14} />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              /* ---- View Mode ---- */
              <>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">{goal.goalName}</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(savingsContribution)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Goal: {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${goalProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Based on 10% balance rule</p>
                </div>
              </>
            )}
          </div>
          <Link to="/add" className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all duration-200 ease-out text-center block active:scale-[0.98]">
            Contribute
          </Link>
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
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out ${
                  filterType === type
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
