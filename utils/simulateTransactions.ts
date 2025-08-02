import { createTransactionSimulator } from '../services/programmaticTransactionSimulator';
import { TransactionType } from '../services/transactionSimulationService';

/**
 * Utility functions to easily simulate transactions from anywhere in the app
 */

/**
 * Simulate a bank deposit transaction
 * @param userId The user ID
 * @param accountId The bank account ID
 * @returns Promise with the result of the transaction simulation
 */
export const simulateBankDeposit = async (userId: string, accountId: string) => {
  const simulator = createTransactionSimulator(userId);
  return simulator.simulateBankDeposit(accountId);
};

/**
 * Simulate a bank withdrawal transaction
 * @param userId The user ID
 * @param accountId The bank account ID
 * @returns Promise with the result of the transaction simulation
 */
export const simulateBankWithdrawal = async (userId: string, accountId: string) => {
  const simulator = createTransactionSimulator(userId);
  return simulator.simulateBankWithdrawal(accountId);
};

/**
 * Simulate a mobile money deposit transaction
 * @param userId The user ID
 * @param accountId The mobile money account ID
 * @returns Promise with the result of the transaction simulation
 */
export const simulateMobileMoneyDeposit = async (userId: string, accountId: string) => {
  const simulator = createTransactionSimulator(userId);
  return simulator.simulateMobileMoneyDeposit(accountId);
};

/**
 * Simulate a mobile money withdrawal transaction
 * @param userId The user ID
 * @param accountId The mobile money account ID
 * @returns Promise with the result of the transaction simulation
 */
export const simulateMobileMoneyWithdrawal = async (userId: string, accountId: string) => {
  const simulator = createTransactionSimulator(userId);
  return simulator.simulateMobileMoneyWithdrawal(accountId);
};

/**
 * Generate multiple random transactions
 * @param userId The user ID
 * @param count Number of transactions to generate
 * @param accountId Optional account ID to associate with the transactions
 * @returns Promise with the results of the transaction simulations
 */
export const generateRandomTransactions = async (userId: string, count: number, accountId?: string) => {
  const simulator = createTransactionSimulator(userId);
  return simulator.generateRandomTransactions(count, accountId);
};

/**
 * Get all bank accounts for a user
 * @param userId The user ID
 * @returns Promise with an array of bank accounts
 */
export const getBankAccounts = async (userId: string) => {
  const simulator = createTransactionSimulator(userId);
  return simulator.getBankAccounts();
};

/**
 * Get all mobile money accounts for a user
 * @param userId The user ID
 * @returns Promise with an array of mobile money accounts
 */
export const getMobileMoneyAccounts = async (userId: string) => {
  const simulator = createTransactionSimulator(userId);
  return simulator.getMobileMoneyAccounts();
};