import React, { createContext, useCallback, useContext, useEffect, useState, } from 'react';
import { dummyAccounts } from '../data/simulatedTransactions';
import { getVaultsForAccount } from '../firebase';

interface Account {
    id: string;
    accountName: string;
    balance: number;
    institution: string;
    logoUrl?: string;
    type?: string;
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
    addVault: (vault: Vault) => void;
    updateVault: (vault: Vault) => void;
    deleteVault: (vaultId: string) => void;
    refreshAccounts: () => Promise<void>;
    savingsStreak: number; // Add savingsStreak to the interface
}

const SavingsContext = createContext<SavingsContextData>({} as SavingsContextData);

export const SavingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingsStreak, setSavingsStreak] = useState(0);


  const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setAccounts(dummyAccounts);
        if (dummyAccounts.length > 0 && !selectedAccount) {
            setSelectedAccount(dummyAccounts[0]);
        }
        setLoading(false);
    }, [selectedAccount]);

    const fetchVaults = useCallback(async () => {
        if (!selectedAccount) {
            setVaults([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await getVaultsForAccount(selectedAccount.id);
            if (result.success && result.data) {
                setVaults(result.data as Vault[]);
            } else {
                setError(result.error || "Failed to fetch vaults.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while fetching vaults.");
        } finally {
            setLoading(false);
        }
    }, [selectedAccount]);

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            fetchVaults();
        }
    }, [selectedAccount, fetchVaults]);

    useEffect(() => {
        // Simulate a savings streak for demonstration
        setSavingsStreak(Math.floor(Math.random() * 30) + 1); // Random streak between 1
    }, []);                                                                     


    const refetch = useCallback(() => {
        fetchAccounts();
        fetchVaults();
    }, [fetchAccounts, fetchVaults]);

    const addVault = (vault: Vault) => {
        setVaults(prevVaults => [...prevVaults, vault]);
    };

    const updateVault = (updatedVault: Vault) => {
        setVaults(prevVaults => prevVaults.map(vault => vault.id === updatedVault.id ? updatedVault : vault));
    };

    const deleteVault = (vaultId: string) => {
        setVaults(prevVaults => prevVaults.filter(vault => vault.id !== vaultId));
    };

    const refreshAccounts = useCallback(async () => {
        return refetch();
    }, [refetch]);

    return (
        <SavingsContext.Provider value={{ accounts, vaults, loading, error, selectedAccount, setSelectedAccount, refetch, addVault, updateVault, deleteVault, refreshAccounts, savingsStreak }}>
            {children}
        </SavingsContext.Provider>
    );
};

export const useSavings = () => {
    return useContext(SavingsContext);
};
