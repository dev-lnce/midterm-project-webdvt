import { memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const TransactionItem = memo(function TransactionItem({ transaction }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isIncome = transaction.type === 'Income';
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
  const iconBg = isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400';
  const amountColor = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100';
  const sign = isIncome ? '+' : '-';

  return (
    <div 
      onClick={() => navigate(`/transaction/${transaction.id}`)}
      className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 ease-out cursor-pointer group active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="text-sm sm:text-base text-slate-900 font-bold dark:text-slate-100">{transaction.description}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(transaction.date)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isIncome ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {transaction.category}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className={`text-lg sm:text-xl font-bold tabular-nums tracking-tight ${amountColor}`}>
          {/* formatCurrency produces "₱1,234.56"; we prepend sign manually to keep +/- visual meaning */}
          {sign}{formatCurrency(Math.abs(transaction.amount))}
        </span>
        <ChevronRight size={20} className="text-slate-400 group-hover:text-emerald-600 dark:text-slate-500 dark:group-hover:text-emerald-400 transition-colors group-hover:translate-x-1 duration-200" />
      </div>
    </div>
  );
});

TransactionItem.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['Income', 'Expense']).isRequired,
    category: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  }).isRequired,
};

export default TransactionItem;
