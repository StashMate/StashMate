import { Timestamp } from 'firebase/firestore';

export const dummyAccounts = [
  {
    id: 'account1',
    institution: 'Bank of StashMate',
    accountName: 'Checking Account',
    balance: 1500.75,
    type: 'bank',
  },
  {
    id: 'account2',
    institution: 'MobilePay Wallet',
    accountName: 'Primary Wallet',
    balance: 500.20,
    type: 'mobile_money',
  },
  {
    id: 'account3',
    institution: 'Savings Bank',
    accountName: 'Savings Account',
    balance: 5000.00,
    type: 'bank',
  },
];

export const simulatedTransactions = [
  // Transactions for account1 (Bank of StashMate - Checking)
  {
    id: 'tx101',
    name: 'Grocery Shopping',
    amount: -75.50,
    category: 'Food',
    type: 'expense',
    date: Timestamp.fromDate(new Date('2025-08-03T10:00:00Z')),
    accountId: 'account1',
    icon: 'cart',
  },
  {
    id: 'tx102',
    name: 'Monthly Salary',
    amount: 2500.00,
    category: 'Income',
    type: 'income',
    date: Timestamp.fromDate(new Date('2025-08-01T15:30:00Z')),
    accountId: 'account1',
    icon: 'cash',
  },
  {
    id: 'tx103',
    name: 'Online Subscription',
    amount: -12.99,
    category: 'Entertainment',
    type: 'expense',
    date: Timestamp.fromDate(new Date('2025-08-02T08:00:00Z')),
    accountId: 'account1',
    icon: 'netflix',
  },
  {
    id: 'tx104',
    name: 'Restaurant Dinner',
    amount: -45.00,
    category: 'Food',
    type: 'expense',
    date: Timestamp.fromDate(new Date('2025-08-04T19:00:00Z')),
    accountId: 'account1',
    icon: 'silverware-fork-knife',
  },

  // Transactions for account2 (MobilePay Wallet - Primary Wallet)
  {
    id: 'tx201',
    name: 'Mobile Top-up',
    amount: -10.00,
    category: 'Utilities',
    type: 'expense',
    date: Timestamp.fromDate(new Date('2025-08-03T12:00:00Z')),
    accountId: 'account2',
    icon: 'cellphone',
  },
  {
    id: 'tx202',
    name: 'Friend Payment',
    amount: 50.00,
    category: 'Social',
    type: 'income',
    date: Timestamp.fromDate(new Date('2025-08-02T18:00:00Z')),
    accountId: 'account2',
    icon: 'account-cash',
  },
  {
    id: 'tx203',
    name: 'Bus Fare',
    amount: -2.50,
    category: 'Transport',
    type: 'expense',
    date: Timestamp.fromDate(new Date('2025-08-04T07:45:00Z')),
    accountId: 'account2',
    icon: 'bus',
  },

  // Transactions for account3 (Savings Bank - Savings Account)
  {
    id: 'tx301',
    name: 'Interest Earned',
    amount: 15.00,
    category: 'Investment',
    type: 'income',
    date: Timestamp.fromDate(new Date('2025-08-01T09:00:00Z')),
    accountId: 'account3',
    icon: 'chart-line',
  },
  {
    id: 'tx302',
    name: 'Transfer to Checking',
    amount: -200.00,
    category: 'Transfer',
    type: 'expense',
    date: Timestamp.fromDate(new Date('2025-08-03T11:00:00Z')),
    accountId: 'account3',
    icon: 'bank-transfer-out',
  },
];
