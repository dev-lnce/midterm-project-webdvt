import { useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useTheme } from '../context/ThemeContext';

export default function Summary() {
  const { transactions } = useTransactions();
  const { theme, toggleTheme } = useTheme();

  // Calculate breakdown of spending by category using useMemo for performance optimization.
  // Instead of recalculating this mapping on every render, it only updates when `transactions` changes.
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

    // Map object to array, calculate percentage, and sort highest to lowest
    return Object.entries(categories)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  return (
    <div className="pt-16 md:pt-20 px-4 md:px-10 pb-24 md:pb-10 max-w-4xl mx-auto">
      
      <div className="flex justify-between items-center mb-8 mt-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed">Spending Summary</h2>
          <p className="text-on-surface-variant font-body-md mt-1 dark:text-outline-variant">Your expenses broken down by category</p>
        </div>
        
        {/* App-Wide Theme Toggle as requested in rubric */}
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-variant transition-colors dark:bg-inverse-on-surface dark:text-inverse-surface"
        >
          <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          <span className="font-label-md hidden md:inline">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="glass-card rounded-xl p-6 md:p-8 shadow-sm">
        <h3 className="font-title-lg text-title-lg text-primary mb-6 dark:text-white border-b border-surface-container-high pb-4 dark:border-outline-variant/30">
          Expense Breakdown
        </h3>
        
        {expenseByCategory.length > 0 ? (
          <div className="space-y-6">
            {expenseByCategory.map((category, index) => (
              <div key={category.name}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-md text-on-surface dark:text-white flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${index % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}></span>
                    {category.name}
                  </span>
                  <div className="text-right">
                    <span className="font-title-lg font-semibold tabular-nums dark:text-white">${category.amount.toFixed(2)}</span>
                    <span className="text-on-surface-variant text-xs ml-2 tabular-nums dark:text-outline-variant">({category.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                {/* Visual Bar - No external chart libraries, pure Tailwind/divs */}
                <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden dark:bg-surface-variant">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${index % 2 === 0 ? 'bg-primary dark:bg-primary-fixed' : 'bg-secondary dark:bg-secondary-fixed'}`} 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-on-surface-variant dark:text-outline-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">pie_chart</span>
            <p>No expenses recorded yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
