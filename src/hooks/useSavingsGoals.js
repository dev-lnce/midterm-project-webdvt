import { useState, useEffect, useCallback } from 'react';

/**
 * useSavingsGoals — Custom hook that persists the user's savings goals to
 * localStorage.
 *
 * localStorage key: 'emerald_budget_savings_goals'
 * Default value: Array with one Emergency Fund goal.
 */
export function useSavingsGoals() {
  const STORAGE_KEY = 'emerald_budget_savings_goals';

  const DEFAULT_GOALS = [
    {
      id: 'default-emergency-fund',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 0,
      autoDeductEnabled: false,
      autoDeductPercentage: 10,
    }
  ];

  const [goals, setGoals] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        } else if (parsed && !Array.isArray(parsed) && parsed.goalName) {
          // Migration from old single goal object
          return [{
            id: 'legacy-goal',
            name: parsed.goalName,
            targetAmount: parsed.targetAmount || 10000,
            currentAmount: 0,
            autoDeductEnabled: false,
            autoDeductPercentage: 10,
          }];
        }
      } catch (e) {
        console.error('Failed to parse stored savings goals', e);
      }
    }
    return DEFAULT_GOALS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const addGoal = useCallback((goal) => {
    setGoals(prev => [...prev, { ...goal, id: Date.now().toString() }]);
  }, []);

  const updateGoal = useCallback((id, updatedData) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updatedData } : g));
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  return { goals, setGoals, addGoal, updateGoal, deleteGoal };
}
