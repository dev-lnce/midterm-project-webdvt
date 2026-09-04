import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { ArrowLeft, Save, Trash2, Edit2, AlertCircle, X, SearchX } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import PaymentMethodBadge from '../components/PaymentMethodBadge';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTransactionById, updateTransaction, deleteTransaction } = useTransactions();

  const [transaction, setTransaction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categories = {
    Income: ['Salary', 'Investment', 'Gift', 'Other'],
    Expense: ['Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Other'],
  };
  const paymentMethods = ['Cash', 'E-Wallet (GCash / Maya)', 'Debit Card', 'Credit Card', 'Bank Transfer'];

  useEffect(() => {
    const tx = getTransactionById(id);
    if (tx) {
      setTransaction(tx);
      setEditForm({
        ...tx,
        paymentMethod: tx.paymentMethod || 'Cash'
      });
    }
  }, [id, getTransactionById]);

  if (!transaction) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-20">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <SearchX size={32} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Transaction Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center w-full font-medium">The transaction you are looking for does not exist or has been deleted.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98]"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteTransaction(id);
    setTimeout(() => navigate('/'), 0);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    if (name === 'type') {
      setEditForm(prev => ({
        ...prev,
        [name]: finalValue,
        category: categories[finalValue][0]
      }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: finalValue }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!editForm.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    const numAmount = Number(editForm.amount);
    if (!editForm.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    } else if (numAmount > 999999999.99) {
      newErrors.amount = 'Amount cannot exceed ₱999,999,999.99';
    }

    if (!editForm.date) {
      newErrors.date = 'Date is required';
    }

    if (!editForm.category?.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!editForm.paymentMethod?.trim()) {
      newErrors.paymentMethod = 'Payment Method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const updated = {
        ...editForm,
        amount: Number(editForm.amount),
        description: editForm.description?.trim() || ''
      };
      updateTransaction(id, updated);
      setTransaction(updated);
      setIsEditing(false);
    }
  };

  const isIncome = transaction.type === 'Income';

  const amountStr = formatCurrency(Math.abs(transaction.amount));
  const amountTextSize = amountStr.length > 18
    ? "text-xl sm:text-2xl"
    : amountStr.length > 14
    ? "text-2xl sm:text-3xl"
    : amountStr.length > 11
    ? "text-3xl sm:text-4xl"
    : "text-4xl sm:text-5xl";

  const descriptionPlaceholder = isIncome
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Transaction Details</h2>
      </div>

      <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 relative">

        {/* Header Area */}
        <div className={`p-8 text-center flex flex-col items-center justify-center w-full overflow-hidden ${isIncome ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : 'bg-rose-50/50 dark:bg-rose-500/5'} border-b border-slate-100 dark:border-slate-800 relative`}>
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-5 shrink-0 ${isIncome ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400'}`}>
            <span className="text-3xl font-bold">{isIncome ? '+' : '-'}</span>
          </div>

          {isEditing ? (
            <div className="relative inline-block w-full max-w-xs">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-bold pointer-events-none ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>₱</span>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                max="999999999.99"
                value={editForm.amount}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2 text-2xl sm:text-4xl font-bold tabular-nums text-center bg-transparent border-b-2 outline-none dark:text-slate-100 transition-colors ${
                  errors.amount ? 'border-rose-500' : 'border-slate-300 dark:border-slate-600 focus:border-emerald-500'
                }`}
              />
              {errors.amount && <p className="text-rose-500 text-xs font-semibold mt-2 absolute -bottom-6 left-0 w-full text-center">{errors.amount}</p>}
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden px-2 flex justify-center">
              <h1 
                title={amountStr}
                className={`${amountTextSize} font-bold tabular-nums tracking-tight whitespace-nowrap truncate max-w-full ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}
              >
                {amountStr}
              </h1>
            </div>
          )}
          
        </div>

        {/* Details Area */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Description {isEditing && <span className="text-rose-500">*</span>}
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="description"
                  value={editForm.description}
                  onChange={handleChange}
                  placeholder={descriptionPlaceholder}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 ${
                    errors.description ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.description && <p className="text-rose-500 text-sm font-medium mt-1">{errors.description}</p>}
              </div>
            ) : (
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 break-words">{transaction.description || <span className="text-slate-400 italic font-normal">No description</span>}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Type</label>
              {isEditing ? (
                <div className="relative">
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 appearance-none rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">
                  <div className={`w-2 h-2 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  {transaction.type}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</label>
              {isEditing ? (
                <div>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 appearance-none rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 ${
                      errors.category ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {categories[editForm.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-rose-500 text-sm font-medium mt-1">{errors.category}</p>}
                </div>
              ) : (
                <p className="font-semibold text-slate-900 dark:text-slate-100">{transaction.category}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Payment Method</label>
              {isEditing ? (
                <div>
                  <select
                    name="paymentMethod"
                    value={editForm.paymentMethod}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 appearance-none rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 ${
                      errors.paymentMethod ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                  {errors.paymentMethod && <p className="text-rose-500 text-sm font-medium mt-1">{errors.paymentMethod}</p>}
                </div>
              ) : (
                <div>
                  {transaction.paymentMethod ? <PaymentMethodBadge method={transaction.paymentMethod} /> : <span className="text-sm text-slate-500 italic">None</span>}
                </div>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Date</label>
              {isEditing ? (
                <div>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleChange}
                    className={`w-full min-w-0 max-w-full box-border appearance-none [-webkit-appearance:none] px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all dark:text-slate-100 ${
                      errors.date ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.date && <p className="text-rose-500 text-sm font-medium mt-1">{errors.date}</p>}
                </div>
              ) : (
                <p className="font-semibold text-slate-900 dark:text-slate-100">{new Date(transaction.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              )}
            </div>
            
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Transaction?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm w-full font-medium">This action cannot be undone. The transaction will be permanently removed.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-all active:scale-[0.98] shadow-sm shadow-rose-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 dark:bg-slate-900/50 dark:border-slate-800">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditForm({
                    ...transaction,
                    paymentMethod: transaction.paymentMethod || 'Cash'
                  });
                  setErrors({});
                  setIsEditing(false);
                }}
                className="flex-[1] py-3.5 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-3.5 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Edit2 size={18} />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 py-3.5 px-4 border-2 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
