import { Timestamp, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../firebase';
import { useSavings } from './SavingsContext';
import { useUser } from './UserContext';
import { simulatedTransactions } from '../data/simulatedTransactions';

interface Transaction {
  id?: string;
  name: string;
  amount: number;
  category: string;
  paymentMethod?: string;
  type: 'income' | 'expense';
  date: string | Timestamp;
  accountId?: string;
  icon?: string; // Added icon property
}

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  refreshTransactions: () => Promise<void>;
  deleteTransaction: (transactionId: string, accountId?: string | null) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }) => {
  const { user } = useUser();
  const { accounts, loading: accountsLoading } = useSavings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const allTransactionsRef = useRef<Record<string, Transaction>>({});
  const [updateTrigger, setUpdateTrigger] = useState(0); // To force re-render when allTransactionsRef changes

  const refreshTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Simulate fetching transactions
    const fetchedTransactions = simulatedTransactions.map(tx => ({
      ...tx,
      date: tx.date instanceof Timestamp ? tx.date.toDate().toISOString() : tx.date,
    }));

    allTransactionsRef.current = {};
    fetchedTransactions.forEach(tx => {
      allTransactionsRef.current[tx.id!] = tx;
    });

    setUpdateTrigger(prev => prev + 1);
    setLoading(false);

    return () => {}; // No cleanup needed for simulated data
  }, []);

  useEffect(() => {
    if (user && !accountsLoading) {
      const unsubscribePromise = refreshTransactions();
      let cleanup: (() => void) | undefined;
      
      // Handle the promise returned by refreshTransactions
      if (unsubscribePromise && typeof unsubscribePromise.then === 'function') {
        unsubscribePromise.then(unsubscribeFn => {
          cleanup = unsubscribeFn;
        });
      }
      
      return () => {
        if (cleanup) {
          cleanup();
        }
      };
    } else if (!user) {
      setTransactions([]);
      setLoading(false);
    }
  }, [user, accountsLoading, refreshTransactions]);

  // Derive the final transactions array from the map
  useEffect(() => {
    const sortedTransactions = Object.values(allTransactionsRef.current).sort((a, b) => {
      const dateA = a.date instanceof Timestamp ? a.date.toMillis() : new Date(a.date as string).getTime();
      const dateB = b.date instanceof Timestamp ? b.date.toMillis() : new Date(b.date as string).getTime();
      return dateB - dateA;
    });
    setTransactions(sortedTransactions);
  }, [updateTrigger]);

  const deleteTransaction = useCallback(async (transactionId: string, accountId?: string | null) => {
    Alert.alert('Info', 'Deletion is disabled in simulation mode.');
  }, []);

  const addTransaction = (transaction: Transaction) => {
    Alert.alert('Info', 'Adding transactions is disabled in simulation mode.');
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, refreshTransactions, deleteTransaction, loading, error }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};