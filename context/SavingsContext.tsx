import React, { createContext, useCallback, useContext, useEffect, useState, } from 'react';
import { dummyAccounts } from '../data/simulatedTransactions';

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
   // For now, vaults will remain empty or can be simulated similarly if needed                           
    setVaults([]);                                                                                         
 }, []);                                                                                                    
                                                                                                           
useEffect(() => {                                                                                          
  fetchAccounts();                                                                                       
   fetchVaults();                                                                                         
    // Simulate a savings streak for demonstration                                                         
     setSavingsStreak(Math.floor(Math.random() * 30) + 1); // Random streak between 1                                                                                                                 
  }, [fetchAccounts, fetchVaults]);                                                                     


    const refetch = () => {
        fetchAccounts();
        fetchVaults();
    }

    const refreshAccounts = useCallback(async () => {
        return refetch();
    }, [refetch]);

    return (
        <SavingsContext.Provider value={{ accounts, vaults, loading, error, selectedAccount, setSelectedAccount, refetch, refreshAccounts, savingsStreak }}>
            {children}
        </SavingsContext.Provider>
    );
};

export const useSavings = () => {
    return useContext(SavingsContext);
};
