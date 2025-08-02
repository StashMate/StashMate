import { Timestamp, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../firebase';
import { useSavings } from './SavingsContext';
import { useUser } from './UserContext';

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
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }

    setLoading(true);
    setError(null);

    allTransactionsRef.current = {}; // Clear previous transactions
    const allUnsubscribes: (() => void)[] = [];
    let completedFetches = 0;
    const totalFetches = accounts.length + 1; // +1 for the user-level transactions

    const handleSnapshot = (snapshot: any, sourceId: string) => {
      const fetchedTransactions: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp ? doc.data().date.toDate().toISOString() : doc.data().date,
      })) as Transaction[];

      // Update the ref with transactions from this specific snapshot
      const currentSnapshotIds = new Set(fetchedTransactions.map(tx => tx.id));
      
      // Remove transactions from this source that are no longer in the snapshot
      for (const txId in allTransactionsRef.current) {
        if (allTransactionsRef.current[txId].accountId === sourceId && !currentSnapshotIds.has(txId)) {
          delete allTransactionsRef.current[txId];
        }
      }

      fetchedTransactions.forEach(tx => {
        allTransactionsRef.current[tx.id!] = { ...tx, sourceId }; // Add/update transactions with sourceId
      });

      setUpdateTrigger(prev => prev + 1); // Trigger re-render
    };

    const handleCompletion = () => {
      completedFetches++;
      if (completedFetches === totalFetches) {
        setLoading(false);
      }
    };

    // 1. Fetch transactions directly under the user (for cash transactions)
    const userTransactionsQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
    const unsubscribeUser = onSnapshot(userTransactionsQuery, 
      (snapshot) => {
        handleSnapshot(snapshot, 'user');
        handleCompletion();
      },
      (err) => {
        console.error("Firestore Error (user transactions):", err);
        setError("Failed to load some transactions.");
        handleCompletion();
      }
    );
    allUnsubscribes.push(unsubscribeUser);

    // 2. Fetch transactions for each linked account
    if (accounts.length === 0) {
      // If no accounts, and we've already fetched user-level, we can set loading to false
      if (completedFetches === totalFetches) {
        setLoading(false);
      }
    } else {
      accounts.forEach(account => {
        const accountTransactionsQuery = query(
          collection(db, 'users', user.uid, 'accounts', account.id, 'transactions'),
          orderBy('date', 'desc')
        );

        const unsubscribeAccount = onSnapshot(accountTransactionsQuery, 
          (snapshot) => {
            handleSnapshot(snapshot, account.id);
            handleCompletion();
          },
          (err) => {
            console.error("Firestore Error (account transactions):", err);
            setError("Failed to load some transactions.");
            handleCompletion();
          }
        );
        allUnsubscribes.push(unsubscribeAccount);
      });
    }

    // Return a cleanup function that calls all unsubscribe functions
    return () => {
      allUnsubscribes.forEach(unsub => {
        if (typeof unsub === 'function') {
          try {
            unsub();
          } catch (error) {
            console.error("Error unsubscribing:", error);
          }
        }
      });
    };
  }, [user, accounts]);

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
    if (!user) return;

    try {
      let docRef;
      if (accountId) {
        docRef = doc(db, 'users', user.uid, 'accounts', accountId, 'transactions', transactionId);
      } else {
        docRef = doc(db, 'users', user.uid, 'transactions', transactionId);
      }
      await deleteDoc(docRef);
      Alert.alert('Success', 'Transaction deleted successfully!');
      refreshTransactions(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting transaction: ", error);
      Alert.alert('Error', 'Failed to delete transaction.');
    }
  }, [user, refreshTransactions]);

  const addTransaction = (transaction: Transaction) => {
    // For now, we'll just add to local state. In a real app, this would involve writing to Firebase.
    setTransactions(prevTransactions => [transaction, ...prevTransactions]);
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