import { useState } from 'react';
import PropTypes from 'prop-types';
import { PiggyBank, Pencil, X, Save, Trash2, AlertCircle, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export default function SavingsGoalCard({ goal, onUpdate, onDelete, unallocatedBalance }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [draft, setDraft] = useState({
    name: goal.name,
    targetAmount: goal.targetAmount,
    autoDeductEnabled: goal.autoDeductEnabled || false,
    autoDeductPercentage: goal.autoDeductPercentage || 10,
    isCustomPct: ![5, 10, 15, 20].includes(goal.autoDeductPercentage),
  });

  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundError, setFundError] = useState('');

  const handleSave = () => {
    const parsedAmount = Number(draft.targetAmount);
    if (!draft.name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
    onUpdate(goal.id, {
      ...draft,
      targetAmount: parsedAmount,
      autoDeductPercentage: Number(draft.autoDeductPercentage)
    });
    setIsEditing(false);
  };

  const handleAddFunds = () => {
    const amt = Number(fundAmount);
    if (isNaN(amt) || amt <= 0) {
      setFundError('Invalid amt');
      return;
    }
    if (amt > unallocatedBalance) {
      setFundError('Exceeds unallocated');
      return;
    }
    onUpdate(goal.id, {
      currentAmount: (goal.currentAmount || 0) + amt
    });
    setIsAddingFunds(false);
    setFundAmount('');
    setFundError('');
  };

  const goalProgress = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 min-w-[300px] sm:min-w-[340px] flex flex-col justify-between relative overflow-hidden shrink-0">
      
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle size={24} className="text-rose-500 mb-2" />
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Delete this goal?</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{isEditing ? 'Edit Goal' : goal.name}</h3>
            {!isEditing && (
              <button
                onClick={() => {
                  setDraft({
                    name: goal.name,
                    targetAmount: goal.targetAmount,
                    autoDeductEnabled: goal.autoDeductEnabled || false,
                    autoDeductPercentage: goal.autoDeductPercentage || 10,
                    isCustomPct: ![5, 10, 15, 20].includes(goal.autoDeductPercentage),
                  });
                  setIsEditing(true);
                }}
                aria-label="Edit savings goal"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
            <PiggyBank size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3 mb-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Goal Name</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm dark:text-slate-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Target Amount (₱)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={draft.targetAmount}
                onChange={(e) => setDraft(prev => ({ ...prev, targetAmount: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm tabular-nums dark:text-slate-100"
              />
            </div>
            
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={draft.autoDeductEnabled}
                  onChange={(e) => setDraft(prev => ({ ...prev, autoDeductEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Auto-deduct from income</span>
              </label>
              
              {draft.autoDeductEnabled && (
                <div className="flex flex-col gap-2 pl-6">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">% of each income transaction to allocate to this goal</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[5, 10, 15, 20].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDraft(prev => ({ ...prev, autoDeductPercentage: pct, isCustomPct: false }))}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          draft.autoDeductPercentage == pct && !draft.isCustomPct
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDraft(prev => ({ ...prev, isCustomPct: true }))}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          draft.isCustomPct
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Custom
                      </button>
                      {draft.isCustomPct && (
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={draft.autoDeductPercentage}
                          onChange={(e) => setDraft(prev => ({ ...prev, autoDeductPercentage: e.target.value }))}
                          className="w-14 px-2 py-1 text-xs rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center outline-none focus:ring-1 focus:ring-emerald-500 dark:text-slate-100"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
                aria-label="Delete goal"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col justify-between sm:items-start gap-1">
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate w-full text-left">
                {formatCurrency(goal.currentAmount || 0)}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate w-full text-left">
                Goal: {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            
            <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shrink-0">
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-start gap-2 h-7 mt-1">
              <div className="flex-1">
                {goal.autoDeductEnabled && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate" title={`Auto-deducts ${goal.autoDeductPercentage}% of income`}>
                    Auto-deducts {goal.autoDeductPercentage}%
                  </p>
                )}
              </div>
              
              {!isAddingFunds ? (
                <button
                  onClick={() => setIsAddingFunds(true)}
                  className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <Plus size={12} /> Add Funds
                </button>
              ) : (
                <div className="shrink-0 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded p-1">
                  <input
                    type="number"
                    autoFocus
                    value={fundAmount}
                    onChange={(e) => { setFundAmount(e.target.value); setFundError(''); }}
                    className={`w-16 bg-transparent text-xs outline-none text-right font-medium dark:text-slate-200 tabular-nums ${fundError ? 'text-rose-500' : ''}`}
                    placeholder="Amt"
                  />
                  <button onClick={handleAddFunds} className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded bg-emerald-100/50 dark:bg-emerald-500/20" aria-label="Save Funds">
                    <Save size={12} />
                  </button>
                  <button onClick={() => { setIsAddingFunds(false); setFundError(''); setFundAmount(''); }} className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Cancel">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            {fundError && <p className="text-[10px] text-rose-500 text-right font-medium absolute bottom-3 right-6">{fundError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

SavingsGoalCard.propTypes = {
  goal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    targetAmount: PropTypes.number.isRequired,
    currentAmount: PropTypes.number,
    autoDeductEnabled: PropTypes.bool,
    autoDeductPercentage: PropTypes.number,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  unallocatedBalance: PropTypes.number,
};
