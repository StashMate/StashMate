import React, { createContext, useContext, useState, ReactNode } from 'react';
import { savingsData, BankAccount } from '../data/savings';

interface SavingsContextType {
  accounts: BankAccount[];
  selectedAccount: BankAccount;
  setSelectedAccount: (account: BankAccount) => void;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider = ({ children }: { children: ReactNode }) => {
  const [accounts] = useState<BankAccount[]>(savingsData);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount>(accounts[0]);

  return (
    <SavingsContext.Provider value={{ accounts, selectedAccount, setSelectedAccount }}>
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
}; 