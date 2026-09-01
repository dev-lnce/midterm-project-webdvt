import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTransactionById, updateTransaction, deleteTransaction } = useTransactions();
  
  const [transaction, setTransaction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const tx = getTransactionById(id);
    if (tx) {
      setTransaction(tx);
      setEditForm(tx);
    }
  }, [id, getTransactionById]);

  if (!transaction) {
    return (
      <div className="pt-24 px-4 text-center h-screen flex flex-col justify-center items-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
        <h2 className="text-2xl font-bold text-primary dark:text-primary-fixed">Transaction Not Found</h2>
        <p className="text-on-surface-variant mb-6 dark:text-outline-variant">The transaction you are looking for does not exist.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-2 rounded-lg font-label-md dark:bg-primary-fixed dark:text-primary-container"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this transaction? This cannot be undone.")) {
      deleteTransaction(id);
      navigate('/');
    }
  };

  const handleSave = () => {
    updateTransaction(id, {
      ...editForm,
      amount: Number(editForm.amount)
    });
    setTransaction({
      ...editForm,
      amount: Number(editForm.amount)
    });
    setIsEditing(false);
  };

  const isIncome = transaction.type === 'Income';

  return (
    <div className="pt-16 md:pt-24 px-4 md:px-10 pb-24 md:pb-10 max-w-2xl mx-auto">
      
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors dark:bg-surface-variant dark:text-white dark:hover:bg-outline-variant/30"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed">Transaction Details</h2>
      </div>

      <div className="glass-card rounded-xl overflow-hidden shadow-sm">
        
        {/* Header Area */}
        <div className={`p-8 text-center ${isIncome ? 'bg-secondary-container/20 dark:bg-secondary/20' : 'bg-error-container/20 dark:bg-error/20'} border-b border-surface-container-high dark:border-outline-variant/20`}>
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isIncome ? 'bg-secondary-container text-secondary' : 'bg-error-container text-error'}`}>
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isIncome ? 'payments' : 'receipt_long'}
            </span>
          </div>
          
          {isEditing ? (
            <input 
              type="number"
              value={editForm.amount}
              onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
              className="text-3xl font-bold text-center bg-transparent border-b border-primary/50 outline-none w-32 dark:text-white"
            />
          ) : (
            <h1 className={`text-4xl font-display-md tabular-nums ${isIncome ? 'text-secondary dark:text-tertiary-fixed' : 'text-on-surface dark:text-white'}`}>
              {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
            </h1>
          )}
        </div>

        {/* Details Area */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 dark:text-outline-variant">Description</label>
            {isEditing ? (
              <input 
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface-container dark:bg-surface-variant dark:border-outline dark:text-white"
              />
            ) : (
              <p className="font-title-lg text-primary dark:text-white">{transaction.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 dark:text-outline-variant">Type</label>
              <p className="font-body-md text-on-surface dark:text-white">{transaction.type}</p>
            </div>
            
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 dark:text-outline-variant">Category</label>
              {isEditing ? (
                <input 
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full px-3 py-1.5 border border-outline-variant rounded-md bg-surface-container dark:bg-surface-variant dark:border-outline dark:text-white"
                />
              ) : (
                <p className="font-body-md text-on-surface dark:text-white">{transaction.category}</p>
              )}
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 dark:text-outline-variant">Date</label>
              {isEditing ? (
                <input 
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="w-full px-3 py-1.5 border border-outline-variant rounded-md bg-surface-container dark:bg-surface-variant dark:border-outline dark:text-white"
                />
              ) : (
                <p className="font-body-md text-on-surface dark:text-white">{new Date(transaction.date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-surface-container-low border-t border-surface-container-high flex gap-4 dark:bg-surface-variant dark:border-outline-variant/20">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setEditForm(transaction);
                  setIsEditing(false);
                }}
                className="flex-1 py-2 border border-outline-variant text-on-surface rounded-lg font-label-md dark:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-2 bg-primary text-white rounded-lg font-label-md dark:bg-primary-fixed dark:text-primary-container"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 border border-primary text-primary rounded-lg font-label-md hover:bg-primary/5 transition-colors dark:border-primary-fixed dark:text-primary-fixed"
              >
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-2 border border-error text-error rounded-lg font-label-md hover:bg-error/5 transition-colors dark:border-error-container dark:text-error-container"
              >
                Delete
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
