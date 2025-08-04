
import { useEffect, useState } from 'react';
import { useSavings } from '../context/SavingsContext';
import { useTransactions } from '../context/TransactionsContext';

export const useNetBalance = () => {
    const { accounts } = useSavings();
    const { transactions } = useTransactions();
    const [netBalance, setNetBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        try {
            // Calculate total balance from all accounts
            const totalAccountBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

            // Net balance is total account balance
            const calculatedNetBalance = totalAccountBalance;
            setNetBalance(calculatedNetBalance);
        } catch (err: any) {
            setError("Failed to calculate net balance: " + err.message);
        }

        setLoading(false);
    }, [accounts, transactions]);

    return { netBalance, loading, error };
};