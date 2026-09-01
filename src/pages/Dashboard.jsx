import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionItem from '../components/TransactionItem';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, Receipt, SearchX } from 'lucide-react';

export default function Dashboard() {
  const { transactions } = useTransactions();
  const [filterType, setFilterType] = useState('All'); // 'All', 'Income', 'Expense'
  
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
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white tabular-nums tracking-tight mb-8">
                ${currentBalance.toFixed(2)}
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-200/70 mb-0.5">Total Income</p>
                  <p className="text-lg font-bold text-white tabular-nums tracking-tight">
                    ${totalIncome.toFixed(2)}
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
                    ${totalExpense.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Action / Goal Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm border border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Savings Goal</h3>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <PiggyBank size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Emergency Fund</p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">${currentBalance > 0 ? (currentBalance * 0.1).toFixed(0) : '0'}</span>
                <span className="text-slate-500 dark:text-slate-400">Goal: $10,000</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(((currentBalance * 0.1) / 10000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Based on 10% balance rule</p>
            </div>
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
