import { TransactionType, simulateTransaction, generateMultipleTransactions } from './transactionSimulationService';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * ProgrammaticTransactionSimulator
 * 
 * This service provides methods to simulate transactions programmatically without a UI.
 * It can be used for testing, demonstrations, or development purposes.
 */
export class ProgrammaticTransactionSimulator {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Simulate a single transaction of a specific type
   * @param type The type of transaction to simulate
   * @param accountId Optional account ID to associate with the transaction
   * @returns Promise with the result of the transaction simulation
   */
  async simulateSingleTransaction(type: TransactionType, accountId?: string) {
    return simulateTransaction(this.userId, type, accountId);
  }

  /**
   * Generate multiple random transactions
   * @param count Number of transactions to generate
   * @param accountId Optional account ID to associate with the transactions
   * @returns Promise with the results of the transaction simulations
   */
  async generateRandomTransactions(count: number, accountId?: string) {
    return generateMultipleTransactions(this.userId, count, accountId);
  }

  /**
   * Get all bank accounts for the current user
   * @returns Promise with an array of bank accounts
   */
  async getBankAccounts() {
    const accountsQuery = query(
      collection(db, 'users', this.userId, 'accounts'),
      where('type', '==', 'bank')
    );
    
    const snapshot = await getDocs(accountsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Get all mobile money accounts for the current user
   * @returns Promise with an array of mobile money accounts
   */
  async getMobileMoneyAccounts() {
    const accountsQuery = query(
      collection(db, 'users', this.userId, 'accounts'),
      where('type', '==', 'mobile_money')
    );
    
    const snapshot = await getDocs(accountsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Simulate a bank deposit transaction
   * @param accountId The bank account ID
   * @returns Promise with the result of the transaction simulation
   */
  async simulateBankDeposit(accountId: string) {
    return this.simulateSingleTransaction(TransactionType.BankDeposit, accountId);
  }

  /**
   * Simulate a bank withdrawal transaction
   * @param accountId The bank account ID
   * @returns Promise with the result of the transaction simulation
   */
  async simulateBankWithdrawal(accountId: string) {
    return this.simulateSingleTransaction(TransactionType.BankWithdrawal, accountId);
  }

  /**
   * Simulate a bank transfer transaction
   * @param accountId The bank account ID
   * @returns Promise with the result of the transaction simulation
   */
  async simulateBankTransfer(accountId: string) {
    return this.simulateSingleTransaction(TransactionType.BankTransfer, accountId);
  }

  /**
   * Simulate a mobile money deposit transaction
   * @param accountId The mobile money account ID
   * @returns Promise with the result of the transaction simulation
   */
  async simulateMobileMoneyDeposit(accountId: string) {
    return this.simulateSingleTransaction(TransactionType.MobileMoneyDeposit, accountId);
  }

  /**
   * Simulate a mobile money withdrawal transaction
   * @param accountId The mobile money account ID
   * @returns Promise with the result of the transaction simulation
   */
  async simulateMobileMoneyWithdrawal(accountId: string) {
    return this.simulateSingleTransaction(TransactionType.MobileMoneyWithdrawal, accountId);
  }

  /**
   * Simulate a mobile money transfer transaction
   * @param accountId The mobile money account ID
   * @returns Promise with the result of the transaction simulation
   */
  async simulateMobileMoneyTransfer(accountId: string) {
    return this.simulateSingleTransaction(TransactionType.MobileMoneyTransfer, accountId);
  }
}

// Export a function to create a simulator instance
export const createTransactionSimulator = (userId: string) => {
  return new ProgrammaticTransactionSimulator(userId);
};