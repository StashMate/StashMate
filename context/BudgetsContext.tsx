import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from './UserContext';

interface Budget {
    id: string;
    category: string;
    amount: number;
    userId: string;
}

interface BudgetsContextType {
    budgets: Budget[];
    loading: boolean;
    error: Error | null;
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
    const [budgets, setBudgets] = useState<Budget[]>([]);
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
            const budgetsList = budgetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
            
            if (budgetsList.length === 0) {
                // Set initial data if no budgets are found in Firebase
                setBudgets([
                    { id: '1', category: 'Groceries', amount: 500, userId: user.uid },
                    { id: '2', category: 'Transport', amount: 150, userId: user.uid },
                    { id: '3', category: 'Entertainment', amount: 200, userId: user.uid },
                    { id: '4', category: 'Utilities', amount: 100, userId: user.uid },
                ]);
            } else {
                setBudgets(budgetsList);
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const refetch = () => {
        fetchBudgets();
    };

    return (
        <BudgetsContext.Provider value={{ budgets, loading, error, refetch }}>
            {children}
        </BudgetsContext.Provider>
    );
};