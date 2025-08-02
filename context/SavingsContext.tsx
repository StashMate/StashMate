
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { useUser } from './UserContext';

interface Account {
    id: string;
    accountName: string;
    balance: number;
    institution: string;
    logoUrl: string;
}

interface Vault {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    icon: string;
    deadline: any;
}

interface SavingsContextData {
    accounts: Account[];
    vaults: Vault[];
    loading: boolean;
    error: string | null;
    selectedAccount: Account | null;
    setSelectedAccount: (account: Account | null) => void;
    refetch: () => void;
    refreshAccounts: () => Promise<void>;
}

const SavingsContext = createContext<SavingsContextData>({} as SavingsContextData);

export const SavingsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(accountsQuery, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
            setAccounts(fetchedAccounts);
            if (fetchedAccounts.length > 0 && !selectedAccount) {
                setSelectedAccount(fetchedAccounts[0]);
            }
            setLoading(false);
        }, (err) => {
            setError("Failed to fetch accounts.");
            setLoading(false);
        });

        return unsubscribe;
    }, [user, selectedAccount]);

    const fetchVaults = useCallback(async () => {
        if (!selectedAccount) return;

        const vaultsQuery = query(collection(db, 'accounts', selectedAccount.id, 'vaults'));
        const unsubscribe = onSnapshot(vaultsQuery, (snapshot) => {
            const fetchedVaults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vault));
            setVaults(fetchedVaults);
        }, (err) => {
            setError("Failed to fetch vaults.");
        });

        return unsubscribe;
    }, [selectedAccount]);

    useEffect(() => {
        const unsubscribe = fetchAccounts();
        return () => {
            unsubscribe?.then(u => u());
        };
    }, [fetchAccounts]);

    useEffect(() => {
        const unsubscribe = fetchVaults();
        return () => {
            unsubscribe?.then(u => u());
        };
    }, [fetchVaults]);

    const refetch = () => {
        fetchAccounts();
        fetchVaults();
    }

    // Alias for refetch to match the interface
    const refreshAccounts = useCallback(async () => {
        return refetch();
    }, [refetch]);

    return (
        <SavingsContext.Provider value={{ accounts, vaults, loading, error, selectedAccount, setSelectedAccount, refetch, refreshAccounts }}>
            {children}
        </SavingsContext.Provider>
    );
};

export const useSavings = () => {
    return useContext(SavingsContext);
};
