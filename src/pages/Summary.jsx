import { useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { PieChart, ListFilter } from 'lucide-react';

export default function Summary() {
  const { transactions } = useTransactions();

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

  const colors = [
    'bg-emerald-600 dark:bg-emerald-500',
    'bg-teal-600 dark:bg-teal-500',
    'bg-cyan-600 dark:bg-cyan-500',
    'bg-indigo-500 dark:bg-indigo-400',
    'bg-rose-500 dark:bg-rose-400',
    'bg-amber-500 dark:bg-amber-400'
  ];

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
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 relative z-10">
          <ListFilter size={20} className="text-slate-400 dark:text-slate-500" />
          Expense Breakdown
        </h3>
        
        {expenseByCategory.length > 0 ? (
          <div className="space-y-8 relative z-10">
            {expenseByCategory.map((category, index) => {
              const colorClass = colors[index % colors.length];
              return (
                <div key={category.name} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full shadow-sm ${colorClass}`}></span>
                      {category.name}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">${category.amount.toFixed(2)}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs ml-2 tabular-nums font-semibold">({category.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 ${colorClass}`} 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
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

    </div>
  );
}
