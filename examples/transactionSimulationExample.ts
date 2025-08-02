import { createTransactionSimulator } from '../services/programmaticTransactionSimulator';
import { TransactionType } from '../services/transactionSimulationService';

/**
 * This example demonstrates how to use the programmatic transaction simulator
 * to generate transactions for presentation purposes.
 * 
 * To use this in your application:
 * 1. Import the createTransactionSimulator function
 * 2. Create a simulator instance with the current user's ID
 * 3. Call the appropriate simulation methods
 */

// Example usage (replace 'YOUR_USER_ID' with the actual user ID)
const runSimulation = async (userId: string) => {
  // Create a simulator instance
  const simulator = createTransactionSimulator(userId);
  
  try {
    // 1. Get all bank accounts
    console.log('Fetching bank accounts...');
    const bankAccounts = await simulator.getBankAccounts();
    console.log(`Found ${bankAccounts.length} bank accounts`);
    
    // 2. Get all mobile money accounts
    console.log('Fetching mobile money accounts...');
    const mobileMoneyAccounts = await simulator.getMobileMoneyAccounts();
    console.log(`Found ${mobileMoneyAccounts.length} mobile money accounts`);
    
    // 3. Simulate transactions if accounts exist
    if (bankAccounts.length > 0) {
      // Simulate a bank deposit
      const bankAccount = bankAccounts[0];
      console.log(`Simulating bank deposit for account: ${bankAccount.accountName || bankAccount.id}`);
      const depositResult = await simulator.simulateBankDeposit(bankAccount.id);
      console.log('Bank deposit result:', depositResult);
      
      // Simulate a bank withdrawal
      console.log(`Simulating bank withdrawal for account: ${bankAccount.accountName || bankAccount.id}`);
      const withdrawalResult = await simulator.simulateBankWithdrawal(bankAccount.id);
      console.log('Bank withdrawal result:', withdrawalResult);
    } else {
      console.log('No bank accounts found to simulate transactions');
    }
    
    if (mobileMoneyAccounts.length > 0) {
      // Simulate a mobile money deposit
      const mobileAccount = mobileMoneyAccounts[0];
      console.log(`Simulating mobile money deposit for account: ${mobileAccount.accountName || mobileAccount.id}`);
      const mobileDepositResult = await simulator.simulateMobileMoneyDeposit(mobileAccount.id);
      console.log('Mobile money deposit result:', mobileDepositResult);
      
      // Simulate a mobile money withdrawal
      console.log(`Simulating mobile money withdrawal for account: ${mobileAccount.accountName || mobileAccount.id}`);
      const mobileWithdrawalResult = await simulator.simulateMobileMoneyWithdrawal(mobileAccount.id);
      console.log('Mobile money withdrawal result:', mobileWithdrawalResult);
    } else {
      console.log('No mobile money accounts found to simulate transactions');
    }
    
    // 4. Generate multiple random transactions (not tied to any account)
    console.log('Generating 5 random transactions...');
    const randomTransactions = await simulator.generateRandomTransactions(5);
    console.log(`Generated ${randomTransactions.length} random transactions`);
    
    console.log('Transaction simulation completed successfully!');
  } catch (error) {
    console.error('Error during transaction simulation:', error);
  }
};

// Example of how to call the simulation function
// runSimulation('YOUR_USER_ID');

export { runSimulation };