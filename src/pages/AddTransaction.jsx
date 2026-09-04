import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { ArrowLeft, TrendingUp, TrendingDown, Save } from 'lucide-react';

export default function AddTransaction() {
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Expense',
    category: 'Food',
    date: (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    paymentMethod: 'Cash',
  });

  const [errors, setErrors] = useState({});

  const categories = {
    Income: ['Salary', 'Investment', 'Gift', 'Other'],
    Expense: ['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Other'],
  };
  
  const paymentMethods = ['Cash', 'E-Wallet (GCash / Maya)', 'Debit Card', 'Credit Card', 'Bank Transfer'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: finalValue,
        category: categories[finalValue][0]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const numAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    } else if (numAmount > 999999999.99) {
      newErrors.amount = 'Amount cannot exceed ₱999,999,999.99';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment Method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      addTransaction({
        description: formData.description.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
      });
      navigate('/');
    }
  };

  const descriptionPlaceholder = formData.type === 'Income'
    ? 'e.g., Monthly Salary, Freelance project'
    : 'e.g., Grocery run, Coffee, Electric bill';

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 ease-out text-slate-600 dark:text-slate-400"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">New Transaction</h2>
      </div>

      <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Type Toggle */}
          <div className="flex rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'type', value: 'Income' } })}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ease-out flex items-center justify-center gap-2 ${
                formData.type === 'Income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp size={16} />
              Income
            </button>
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'type', value: 'Expense' } })}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ease-out flex items-center justify-center gap-2 ${
                formData.type === 'Expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <TrendingDown size={16} />
              Expense
            </button>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
              <span>Amount</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">₱</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="999999999.99"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full pl-9 pr-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all tabular-nums dark:text-slate-100 ${
                  errors.amount ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="text-rose-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
              <span>Description <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 ${
                errors.description ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
              }`}
              placeholder={descriptionPlaceholder}
            />
            {errors.description && <p className="text-rose-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 z-10 relative">
            {/* Category */}
            <div className="flex flex-col gap-1.5 z-20 relative">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100"
                >
                  {categories[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.category && <p className="text-rose-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-1.5 z-10 relative">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
              <div className="relative">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 appearance-none rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 ${
                    errors.paymentMethod ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.paymentMethod && <p className="text-rose-500 text-sm mt-1">{errors.paymentMethod}</p>}
            </div>
          </div>
          
          {/* Date */}
          <div className="flex flex-col gap-1.5 w-full overflow-hidden">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
            <div className="w-full min-w-0 max-w-full box-border">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full min-w-0 max-w-full box-border appearance-none [-webkit-appearance:none] px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 ${
                  errors.date ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
            </div>
            {errors.date && <p className="text-rose-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors duration-200 ease-out dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all duration-200 ease-out active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
