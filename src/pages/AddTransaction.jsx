import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';

export default function AddTransaction() {
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });

  const [errors, setErrors] = useState({});

  const categories = {
    Income: ['Salary', 'Investment', 'Gift', 'Other'],
    Expense: ['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Other'],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-update category if type changes to prevent invalid category/type combos
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        category: categories[value][0]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }
    if (!formData.date) newErrors.date = 'Date is required';
    
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
      });
      navigate('/'); // Go back to dashboard on success
    }
  };

  return (
    <div className="pt-16 md:pt-20 px-4 md:px-10 pb-24 md:pb-10 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg glass-card rounded-xl p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed">Add Transaction</h2>
          <p className="text-on-surface-variant font-body-md mt-1 dark:text-outline-variant">Record a new income or expense.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-outline-variant dark:border-outline p-1 bg-surface-container-low dark:bg-surface-variant">
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'type', value: 'Income' } })}
              className={`flex-1 py-2 font-label-md text-label-md text-center rounded-md transition-colors ${
                formData.type === 'Income' 
                  ? 'bg-secondary text-white shadow-sm dark:bg-secondary-container dark:text-secondary' 
                  : 'text-on-surface-variant hover:bg-surface-variant dark:text-inverse-on-surface'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'type', value: 'Expense' } })}
              className={`flex-1 py-2 font-label-md text-label-md text-center rounded-md transition-colors ${
                formData.type === 'Expense' 
                  ? 'bg-error text-white shadow-sm dark:bg-error-container dark:text-error' 
                  : 'text-on-surface-variant hover:bg-surface-variant dark:text-inverse-on-surface'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface mb-1 dark:text-outline-variant">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg bg-surface-container border focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-surface-variant dark:text-white ${
                errors.description ? 'border-error' : 'border-outline-variant/50 dark:border-outline'
              }`}
              placeholder="e.g. Grocery shopping"
            />
            {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface mb-1 dark:text-outline-variant">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg bg-surface-container border focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-surface-variant dark:text-white ${
                errors.amount ? 'border-error' : 'border-outline-variant/50 dark:border-outline'
              }`}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-error text-xs mt-1">{errors.amount}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-1 dark:text-outline-variant">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-surface-variant dark:text-white dark:border-outline"
              >
                {categories[formData.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-1 dark:text-outline-variant">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg bg-surface-container border focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-surface-variant dark:text-white ${
                  errors.date ? 'border-error' : 'border-outline-variant/50 dark:border-outline'
                }`}
              />
              {errors.date && <p className="text-error text-xs mt-1">{errors.date}</p>}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 border border-outline-variant rounded-lg text-on-surface font-label-md hover:bg-surface-container transition-colors dark:text-white dark:hover:bg-surface-variant"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 bg-primary text-white rounded-lg font-label-md shadow-sm hover:bg-primary-container transition-colors dark:bg-primary-fixed dark:text-primary-container dark:hover:bg-primary-fixed-dim"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
