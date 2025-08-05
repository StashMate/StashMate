import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
        console.log('BudgetsContext: fetchBudgets called.');
        console.log('BudgetsContext: User in context:', user ? user.uid : 'No user');

        if (!user) {
            console.log('BudgetsContext: No user, setting budgets to empty and loading to false.');
            setBudgets([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        console.log('BudgetsContext: Loading set to true. Attempting to fetch budgets for user:', user.uid);
        try {
            const budgetsCollection = collection(db, 'users', user.uid, 'budgets');
            const budgetSnapshot = await getDocs(budgetsCollection);
            const budgetsList = budgetSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as BudgetItem[];
            setBudgets(budgetsList);
            console.log('BudgetsContext: Fetched budgets successfully. Count:', budgetsList.length);
        } catch (err) {
            console.error('BudgetsContext: Error fetching budgets:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
            console.log('BudgetsContext: Loading set to false.');
        }
    }, [user]);

    const addBudgetItem = useCallback(async (item: Omit<BudgetItem, 'id'>) => {
        if (!user) {
            console.log('BudgetsContext: addBudgetItem - No user, returning.');
            return;
        }
        console.log('BudgetsContext: addBudgetItem - Attempting to add item:', item);
        try {
            const docRef = await addDoc(collection(db, 'users', user.uid, 'budgets'), {
                ...item,
                userId: user.uid,
            });
            console.log('BudgetsContext: addBudgetItem - Item added successfully with ID:', docRef.id);
            fetchBudgets();
        } catch (err) {
            console.error("BudgetsContext: Error adding budget item:", err);
            setError(err as Error);
        }
    }, [user, fetchBudgets]);

    const updateBudgetItem = useCallback(async (id: string, item: Partial<BudgetItem>) => {
        if (!user) {
            console.log('BudgetsContext: updateBudgetItem - No user, returning.');
            return;
        }
        console.log('BudgetsContext: updateBudgetItem - Attempting to update item ID:', id, 'with data:', item);
        try {
            await updateDoc(doc(db, 'users', user.uid, 'budgets', id), item);
            console.log('BudgetsContext: updateBudgetItem - Item updated successfully for ID:', id);
            fetchBudgets();
        } catch (err) {
            console.error("BudgetsContext: Error updating budget item:", err);
            setError(err as Error);
        }
    }, [user, fetchBudgets]);

    const deleteBudgetItem = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
            fetchBudgets();
        } catch (err) {
            console.error("Error deleting budget item:", err);
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