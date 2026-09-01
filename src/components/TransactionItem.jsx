import { memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// We wrap TransactionItem in React.memo to prevent unnecessary re-renders.
// Since the Dashboard lists many transactions, changing one transaction 
// (or filtering) might cause the entire list to re-render. With React.memo, 
// this component only re-renders if its specific props (the transaction object) change.
const TransactionItem = memo(function TransactionItem({ transaction }) {
  const navigate = useNavigate();

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determine styles and icon based on type
  const isIncome = transaction.type === 'Income';
  const icon = isIncome ? 'payments' : 'receipt_long';
  const iconBg = isIncome ? 'bg-secondary-container/30 text-secondary' : 'bg-error-container/30 text-error';
  const amountColor = isIncome ? 'text-secondary dark:text-tertiary-fixed' : 'text-on-surface dark:text-white';
  const sign = isIncome ? '+' : '-';

  return (
    <div 
      onClick={() => navigate(`/transaction/${transaction.id}`)}
      className="p-4 md:p-6 flex items-center justify-between hover:bg-surface-container/50 transition-colors cursor-pointer group border-b border-surface-container-high last:border-0 dark:hover:bg-surface-variant/20 dark:border-outline-variant/30"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        <div>
          <h4 className="font-title-lg text-[16px] md:text-title-lg text-primary dark:text-primary-fixed">{transaction.description}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline-variant">{formatDate(transaction.date)}</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${isIncome ? 'bg-secondary-container/50 text-secondary' : 'bg-surface-variant text-on-surface-variant dark:bg-surface-container-high dark:text-on-surface'}`}>
              {transaction.category}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`font-title-lg text-title-lg font-semibold tabular-nums ${amountColor}`}>
          {sign}${Math.abs(transaction.amount).toFixed(2)}
        </span>
        <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors dark:group-hover:text-primary-fixed">chevron_right</span>
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
