export type Vault = {
  name: string;
  icon: string;
  amount: number;
};

export type BankAccount = {
  id: number;
  bankName: string;
  totalSavings: number;
  vaults: Vault[];
};

export const savingsData: BankAccount[] = [
  {
    id: 1,
    bankName: 'StashMate Bank',
    totalSavings: 7500,
    vaults: [
        {
            name: 'Emergency Fund',
            icon: 'shield-checkmark-outline',
            amount: 5000,
        },
        {
            name: 'Vacation Fund',
            icon: 'airplane-outline',
            amount: 1500,
        },
        {
            name: 'New Gadgets',
            icon: 'phone-portrait-outline',
            amount: 1000,
        },
    ],
  },
  {
    id: 2,
    bankName: 'Legacy Trust',
    totalSavings: 12500,
    vaults: [
      {
        name: 'Retirement',
        icon: 'hourglass-outline',
        amount: 10000,
      },
      {
        name: 'Car Downpayment',
        icon: 'car-sport-outline',
        amount: 2500,
      },
    ],
  }
]; 