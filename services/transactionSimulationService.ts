import { Timestamp, collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

// Types of transactions that can be simulated
export enum TransactionType {
  BankDeposit = 'Bank Deposit',
  BankWithdrawal = 'Bank Withdrawal',
  BankTransfer = 'Bank Transfer',
  MobileMoneyDeposit = 'Mobile Money Deposit',
  MobileMoneyWithdrawal = 'Mobile Money Withdrawal',
  MobileMoneyTransfer = 'Mobile Money Transfer',
  BillPayment = 'Bill Payment',
  OnlinePurchase = 'Online Purchase',
  Subscription = 'Subscription',
  Salary = 'Salary',
  Investment = 'Investment',
}

// Categories for expenses
const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Housing',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Bills & Payments',
];

// Common transaction names for each category
const transactionNamesByCategory = {
  'Food & Dining': ['Restaurant', 'Grocery Store', 'Coffee Shop', 'Fast Food', 'Food Delivery'],
  'Transportation': ['Fuel', 'Public Transport', 'Taxi', 'Ride Share', 'Car Maintenance'],
  'Entertainment': ['Movie Theater', 'Concert', 'Streaming Service', 'Game Purchase', 'Sports Event'],
  'Shopping': ['Clothing Store', 'Electronics', 'Online Shopping', 'Department Store', 'Home Goods'],
  'Utilities': ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Gas Bill', 'Phone Bill'],
  'Housing': ['Rent Payment', 'Mortgage', 'Home Insurance', 'Property Tax', 'Home Repair'],
  'Healthcare': ['Doctor Visit', 'Pharmacy', 'Health Insurance', 'Dental Care', 'Vision Care'],
  'Education': ['Tuition', 'Books', 'School Supplies', 'Course Fee', 'Student Loan'],
  'Travel': ['Flight Ticket', 'Hotel Booking', 'Car Rental', 'Travel Insurance', 'Vacation Package'],
  'Personal Care': ['Haircut', 'Spa', 'Gym Membership', 'Beauty Products', 'Personal Trainer'],
  'Gifts & Donations': ['Birthday Gift', 'Charity Donation', 'Wedding Gift', 'Holiday Gift', 'Fundraiser'],
  'Bills & Payments': ['Credit Card Payment', 'Loan Payment', 'Subscription Fee', 'Membership Fee', 'Insurance Premium'],
};

// Common income sources
const incomeSources = [
  'Salary',
  'Freelance Work',
  'Investment Return',
  'Rental Income',
  'Side Business',
  'Refund',
  'Gift',
  'Bonus',
  'Commission',
];

// Payment methods
const paymentMethods = [
  'Bank Transfer',
  'Mobile Money',
  'Cash',
  'Credit Card',
  'Debit Card',
];

// Banks and mobile money providers
const banks = [
  'First Bank',
  'Trust Bank',
  'City Bank',
  'National Bank',
  'Community Bank',
];

const mobileMoneyProviders = [
  'MTN Mobile Money',
  'Airtel Money',
  'Vodafone Cash',
  'Orange Money',
  'T-Mobile Money',
];

// Helper function to get a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get a random amount within a range
const getRandomAmount = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Helper function to get a random date within the last n days
const getRandomDate = (daysBack: number): Timestamp => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return Timestamp.fromDate(date);
};

// Generate a random transaction
export const generateRandomTransaction = (type: 'income' | 'expense', accountId?: string) => {
  if (type === 'income') {
    const source = getRandomItem(incomeSources);
    const amount = getRandomAmount(100, 5000);
    const paymentMethod = getRandomItem(paymentMethods);
    
    return {
      name: source,
      amount: amount,
      type: 'income',
      category: 'Income',
      paymentMethod: paymentMethod,
      date: getRandomDate(30),
      accountId: accountId || null,
      icon: 'cash-plus',
    };
  } else {
    const category = getRandomItem(expenseCategories);
    const name = getRandomItem(transactionNamesByCategory[category]);
    const amount = -getRandomAmount(10, 500); // Negative for expenses
    const paymentMethod = getRandomItem(paymentMethods);
    
    return {
      name: name,
      amount: amount,
      type: 'expense',
      category: category,
      paymentMethod: paymentMethod,
      date: getRandomDate(30),
      accountId: accountId || null,
      icon: 'cash-minus',
    };
  }
};

// Simulate a specific type of transaction
export const simulateTransaction = async (userId: string, transactionType: TransactionType, accountId?: string) => {
  let transaction;
  
  switch (transactionType) {
    case TransactionType.BankDeposit:
      transaction = {
        name: `Deposit at ${getRandomItem(banks)}`,
        amount: getRandomAmount(100, 2000),
        type: 'income',
        category: 'Income',
        paymentMethod: 'Bank Transfer',
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'bank-plus',
      };
      break;
      
    case TransactionType.BankWithdrawal:
      transaction = {
        name: `Withdrawal from ${getRandomItem(banks)}`,
        amount: -getRandomAmount(50, 1000),
        type: 'expense',
        category: 'Withdrawal',
        paymentMethod: 'Bank Transfer',
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'bank-minus',
      };
      break;
      
    case TransactionType.BankTransfer:
      transaction = {
        name: `Transfer to ${getRandomItem(banks)}`,
        amount: -getRandomAmount(100, 1500),
        type: 'expense',
        category: 'Transfer',
        paymentMethod: 'Bank Transfer',
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'bank-transfer',
      };
      break;
      
    case TransactionType.MobileMoneyDeposit:
      transaction = {
        name: `${getRandomItem(mobileMoneyProviders)} Deposit`,
        amount: getRandomAmount(50, 500),
        type: 'income',
        category: 'Income',
        paymentMethod: 'Mobile Money',
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'cellphone-arrow-down',
      };
      break;
      
    case TransactionType.MobileMoneyWithdrawal:
      transaction = {
        name: `${getRandomItem(mobileMoneyProviders)} Withdrawal`,
        amount: -getRandomAmount(20, 300),
        type: 'expense',
        category: 'Withdrawal',
        paymentMethod: 'Mobile Money',
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'cellphone-arrow-up',
      };
      break;
      
    case TransactionType.MobileMoneyTransfer:
      transaction = {
        name: `${getRandomItem(mobileMoneyProviders)} Transfer`,
        amount: -getRandomAmount(10, 200),
        type: 'expense',
        category: 'Transfer',
        paymentMethod: 'Mobile Money',
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'cellphone-wireless',
      };
      break;
      
    case TransactionType.BillPayment:
      transaction = {
        name: `${getRandomItem(['Electricity', 'Water', 'Internet', 'TV', 'Gas'])} Bill`,
        amount: -getRandomAmount(30, 200),
        type: 'expense',
        category: 'Bills & Payments',
        paymentMethod: getRandomItem(['Bank Transfer', 'Mobile Money']),
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'file-document-outline',
      };
      break;
      
    case TransactionType.OnlinePurchase:
      transaction = {
        name: `${getRandomItem(['Amazon', 'eBay', 'Jumia', 'Alibaba', 'Shopify'])} Purchase`,
        amount: -getRandomAmount(20, 500),
        type: 'expense',
        category: 'Shopping',
        paymentMethod: getRandomItem(['Bank Transfer', 'Mobile Money']),
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'cart-outline',
      };
      break;
      
    case TransactionType.Subscription:
      transaction = {
        name: `${getRandomItem(['Netflix', 'Spotify', 'YouTube Premium', 'iCloud', 'Microsoft 365'])} Subscription`,
        amount: -getRandomAmount(5, 50),
        type: 'expense',
        category: 'Entertainment',
        paymentMethod: getRandomItem(['Bank Transfer', 'Mobile Money']),
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'refresh',
      };
      break;
      
    case TransactionType.Salary:
      transaction = {
        name: 'Monthly Salary',
        amount: getRandomAmount(1000, 5000),
        type: 'income',
        category: 'Income',
        paymentMethod: 'Bank Transfer',
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'cash-multiple',
      };
      break;
      
    case TransactionType.Investment:
      transaction = {
        name: `${getRandomItem(['Stock', 'Bond', 'Mutual Fund', 'ETF', 'Crypto'])} Investment`,
        amount: -getRandomAmount(100, 2000),
        type: 'expense',
        category: 'Investment',
        paymentMethod: 'Bank Transfer',
        date: serverTimestamp(),
        accountId: accountId,
        icon: 'chart-line',
      };
      break;
      
    default:
      // Generate a random transaction if type not specified
      transaction = generateRandomTransaction(Math.random() > 0.7 ? 'income' : 'expense', accountId);
  }
  
  try {
    // Determine where to store the transaction
    let transactionCollectionRef;
    if (!accountId || transaction.paymentMethod === 'Cash') {
      transactionCollectionRef = collection(db, 'users', userId, 'transactions');
    } else {
      transactionCollectionRef = collection(db, 'users', userId, 'accounts', accountId, 'transactions');
    }
    
    // Add the transaction to Firestore
      const docRef = await addDoc(transactionCollectionRef, transaction);
      
      // Update account balance if this transaction is associated with an account
      if (accountId) {
        const accountRef = doc(db, 'users', userId, 'accounts', accountId);
        await updateDoc(accountRef, {
          lastUpdated: new Date().toISOString(),
          // Update the balance based on the transaction amount
          balance: increment(transaction.amount)
        });
      }
      
      return { success: true, id: docRef.id, transaction };
  } catch (error) {
    console.error('Error adding simulated transaction:', error);
    return { success: false, error };
  }
};

// Generate multiple random transactions
export const generateMultipleTransactions = async (userId: string, count: number, accountId?: string) => {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    // 70% chance of expense, 30% chance of income
    const type = Math.random() > 0.7 ? 'income' : 'expense';
    const transaction = generateRandomTransaction(type, accountId);
    
    try {
      // Determine where to store the transaction
      let transactionCollectionRef;
      if (!accountId || transaction.paymentMethod === 'Cash') {
        transactionCollectionRef = collection(db, 'users', userId, 'transactions');
      } else {
        transactionCollectionRef = collection(db, 'users', userId, 'accounts', accountId, 'transactions');
      }
      
      // Add the transaction to Firestore
      const docRef = await addDoc(transactionCollectionRef, transaction);
      results.push({ success: true, id: docRef.id, transaction });
      
      // Update account balance if this transaction is associated with an account
      if (accountId) {
        const accountRef = doc(db, 'users', userId, 'accounts', accountId);
        await updateDoc(accountRef, {
          lastUpdated: new Date().toISOString(),
          // Update the balance based on the transaction amount
          balance: increment(transaction.amount)
        });
      }
    } catch (error) {
      console.error('Error adding random transaction:', error);
      results.push({ success: false, error });
    }
  }
  
  return results;
};