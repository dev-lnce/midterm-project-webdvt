import { useState, useEffect, useCallback } from 'react';

// A custom hook to manage transaction data. 
// This acts as our single source of truth for all components.
export function useTransactions() {
  const [transactions, setTransactions] = useState([]);

  // Load transactions from localStorage when the hook mounts
  useEffect(() => {
    const stored = localStorage.getItem('emerald_budget_transactions');
    if (stored) {
      try {
        setTransactions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored transactions', e);
      }
    }
  }, []);

  // Sync transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('emerald_budget_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Add a new transaction
  // useCallback is used here to prevent recreating the function on every render, 
  // which is an optimization for components that depend on it.
  const addTransaction = useCallback((transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(), // simple unique ID
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  // Update an existing transaction by ID
  const updateTransaction = useCallback((id, updatedData) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );
  }, []);

  // Delete a transaction by ID
  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Get a specific transaction by ID
  const getTransactionById = useCallback(
    (id) => {
      return transactions.find((t) => t.id === id);
    },
    [transactions]
  );

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
  };
}
