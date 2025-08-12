import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { useUser } from './UserContext';

interface BudgetItem {
    id: string;
    name: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    allocated: number;
    deductFromIncome: boolean;
}

interface BudgetsContextType {
    budgets: BudgetItem[];
    loading: boolean;
    error: Error | null;
    addBudgetItem: (item: Omit<BudgetItem, 'id'>) => Promise<void>;
    updateBudgetItem: (id: string, item: Partial<BudgetItem>) => Promise<void>;
    deleteBudgetItem: (id: string) => Promise<void>;
    refetch: () => void;
}

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export const useBudgets = () => {
    const context = useContext(BudgetsContext);
    if (!context) {
        throw new Error('useBudgets must be used within a BudgetsProvider');
    }
    return context;
};

export const BudgetsProvider = ({ children }) => {
    const { user } = useUser();
    const [budgets, setBudgets] = useState<BudgetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBudgets = useCallback(async () => {


        if (!user) {
            setBudgets([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const budgetsCollection = collection(db, 'users', user.uid, 'budgets');
            const budgetSnapshot = await getDocs(budgetsCollection);
            const budgetsList = budgetSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as BudgetItem[];
            setBudgets(budgetsList);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addBudgetItem = useCallback(async (item: Omit<BudgetItem, 'id'>) => {
        if (!user) {
            return;
        }
        try {
            const docRef = await addDoc(collection(db, 'users', user.uid, 'budgets'), {
                ...item,
                userId: user.uid,
            });

            fetchBudgets();
        } catch (err) {
            setError(err as Error);
        }
    }, [user, fetchBudgets]);

    const updateBudgetItem = useCallback(async (id: string, item: Partial<BudgetItem>) => {
        if (!user) {
            return;
        }
        try {
            await updateDoc(doc(db, 'users', user.uid, 'budgets', id), item);

            fetchBudgets();
        } catch (err) {
            setError(err as Error);
        }
    }, [user, fetchBudgets]);

    const deleteBudgetItem = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
            fetchBudgets();
        } catch (err) {
            setError(err as Error);
        }
    }, [user, fetchBudgets]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const refetch = () => {
        fetchBudgets();
    };

    return (
        <BudgetsContext.Provider value={{ budgets, loading, error, addBudgetItem, updateBudgetItem, deleteBudgetItem, refetch }}>
            {children}
        </BudgetsContext.Provider>
    );
};