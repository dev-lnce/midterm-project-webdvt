import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionItem from '../components/TransactionItem';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { transactions } = useTransactions();
  const [filterType, setFilterType] = useState('All'); // 'All', 'Income', 'Expense'
  
  // PERFORMANCE OPTIMIZATION: useMemo
  // Calculating totals and filtering lists can be expensive if there are many transactions.
  // By using useMemo, we only recalculate these values when the `transactions` array 
  // or `filterType` state actually changes, rather than on every single component render.
  const { totalIncome, totalExpense, currentBalance, filteredTransactions } = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    // Calculate totals
    transactions.forEach(t => {
      if (t.type === 'Income') income += t.amount;
      else expense += t.amount;
    });

    // Filter transactions
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
    <div className="pt-16 md:pt-20 px-4 md:px-10 pb-24 md:pb-10">
      <div className="max-w-6xl mx-auto space-y-8 mt-6">
        
        {/* Bento Grid Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Hero Card */}
          <div className="lg:col-span-2 rounded-xl bg-primary-container text-white p-6 md:p-8 relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[240px] dark:bg-primary">
            {/* Abstract Background Pattern */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-tertiary-container rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute right-10 bottom-10 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
            </div>
            
            <div className="relative z-10">
              <p className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-wider mb-2 dark:text-primary-fixed">Current Balance</p>
              <h2 className="font-display-lg text-[48px] md:text-[64px] leading-tight text-white mb-6 tabular-nums">
                ${currentBalance.toFixed(2)}
              </h2>
            </div>
            
            <div className="flex gap-4 md:gap-8 relative z-10 border-t border-white/20 pt-4">
              <div>
                <p className="font-label-sm text-label-sm text-primary-fixed-dim mb-1 dark:text-primary-fixed">Income</p>
                <p className="font-title-lg text-title-lg text-tertiary-fixed flex items-center gap-1 tabular-nums">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  +${totalIncome.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-primary-fixed-dim mb-1 dark:text-primary-fixed">Expenses</p>
                <p className="font-title-lg text-title-lg text-white flex items-center gap-1 tabular-nums">
                  <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  -${totalExpense.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Action Card (Placeholder for visual completeness from design) */}
          <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-title-lg text-title-lg text-primary dark:text-primary-fixed">Savings Goal</h3>
                <span className="material-symbols-outlined text-primary-container bg-surface-container-high p-2 rounded-full dark:bg-surface-variant dark:text-on-surface">savings</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 dark:text-outline-variant">Emergency Fund</p>
              
              <div className="space-y-2">
                <div className="flex justify-between font-label-md text-label-md">
                  <span className="text-primary font-semibold dark:text-primary-fixed">${currentBalance > 0 ? (currentBalance * 0.1).toFixed(0) : '0'}</span>
                  <span className="text-on-surface-variant dark:text-outline-variant">$10,000</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden dark:bg-surface-variant">
                  <div className="bg-primary-container h-full rounded-full dark:bg-primary" style={{ width: `${Math.min(((currentBalance * 0.1) / 10000) * 100, 100)}%` }}></div>
                </div>
                <p className="text-right font-label-sm text-label-sm text-on-surface-variant mt-1 dark:text-outline-variant">Based on 10% balance</p>
              </div>
            </div>
            <Link to="/add" className="w-full mt-6 py-2 border-2 border-primary-container/10 text-primary-container font-label-md text-label-md rounded-lg hover:bg-primary-container hover:text-white transition-colors text-center block dark:text-primary-fixed dark:border-primary-fixed/20 dark:hover:bg-primary">
              Add Funds
            </Link>
          </div>
        </div>

        {/* Transactions Section */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed">Recent Transactions</h3>
            
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
              <button 
                onClick={() => setFilterType('All')}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
                  filterType === 'All' ? 'bg-primary-container text-white shadow-sm dark:bg-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface dark:bg-surface-variant dark:text-inverse-on-surface dark:hover:bg-surface-variant/80'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('Income')}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
                  filterType === 'Income' ? 'bg-primary-container text-white shadow-sm dark:bg-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface dark:bg-surface-variant dark:text-inverse-on-surface dark:hover:bg-surface-variant/80'
                }`}
              >
                Income
              </button>
              <button 
                onClick={() => setFilterType('Expense')}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
                  filterType === 'Expense' ? 'bg-primary-container text-white shadow-sm dark:bg-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface dark:bg-surface-variant dark:text-inverse-on-surface dark:hover:bg-surface-variant/80'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="divide-y divide-surface-container-high dark:divide-outline-variant/20">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <div className="p-12 text-center text-on-surface-variant dark:text-outline-variant">
                  <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                  <p>No transactions found.</p>
                  <Link to="/add" className="text-primary font-semibold hover:underline mt-2 inline-block dark:text-primary-fixed">Add your first transaction</Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
