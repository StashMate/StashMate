
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';

interface Account {
    id: string;
    balance: number;
}

interface Transaction {
    amount: number;
    type: 'income' | 'expense';
}

export const useNetBalance = () => {
    const { user } = useUser();
    const [netBalance, setNetBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const calculateNetBalance = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch all accounts
                const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
                const accountsSnapshot = await getDocs(accountsQuery);
                const accounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));

                // Fetch all transactions
                const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid));
                const transactionsSnapshot = await getDocs(transactionsQuery);
                const transactions = transactionsSnapshot.docs.map(doc => doc.data() as Transaction);

                // Calculate total initial balance from all accounts
                const initialBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

                // Calculate total income and expenses
                const { totalIncome, totalExpense } = transactions.reduce((acc, transaction) => {
                    if (transaction.type === 'income') {
                        acc.totalIncome += transaction.amount;
                    } else {
                        acc.totalExpense += transaction.amount;
                    }
                    return acc;
                }, { totalIncome: 0, totalExpense: 0 });

                // Calculate net balance
                const netBalance = initialBalance + totalIncome - totalExpense;
                setNetBalance(netBalance);
            } catch (err) {
                setError("Failed to calculate net balance.");
            }

            setLoading(false);
        };

        calculateNetBalance();
    }, [user]);

    return { netBalance, loading, error };
};