import PropTypes from 'prop-types';
import { CreditCard, Banknote, Smartphone, Landmark, Wallet } from 'lucide-react';

export default function PaymentMethodBadge({ method }) {
  if (!method) return null;
  
  const getIcon = () => {
    switch(method) {
      case 'Cash': return <Banknote size={12} />;
      case 'GCash':
      case 'Maya': return <Smartphone size={12} />;
      case 'Bank Transfer': return <Landmark size={12} />;
      case 'Credit/Debit Card': return <CreditCard size={12} />;
      default: return <Wallet size={12} />;
    }
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
      {getIcon()}
      {method}
    </span>
  );
}

PaymentMethodBadge.propTypes = {
  method: PropTypes.string,
};
