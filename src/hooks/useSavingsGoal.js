import { useState, useEffect } from 'react';

/**
 * useSavingsGoal — Custom hook that persists the user's savings goal to
 * localStorage, following the same pattern as useTransactions.js.
 *
 * localStorage key: 'emerald_budget_savings_goal'
 * Default value: { goalName: 'Emergency Fund', targetAmount: 10000 }
 *
 * Returns:
 *   goal        — the current { goalName, targetAmount } object
 *   setSavingsGoal(newGoal) — writes updated goal to state + localStorage
 */
export function useSavingsGoal() {
  const STORAGE_KEY = 'emerald_budget_savings_goal';

  const DEFAULT_GOAL = {
    goalName: 'Emergency Fund',
    targetAmount: 10000,
  };

  const [goal, setGoal] = useState(() => {
    // Lazy initializer — runs once on mount.
    // Read from localStorage immediately so the initial render
    // has the correct value without a flicker.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored savings goal', e);
      }
    }
    return DEFAULT_GOAL;
  });

  // Sync goal to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
  }, [goal]);

  /**
   * Updates the savings goal.
   * @param {{ goalName: string, targetAmount: number }} newGoal
   */
  const setSavingsGoal = (newGoal) => {
    setGoal(newGoal);
  };

  return { goal, setSavingsGoal };
}
