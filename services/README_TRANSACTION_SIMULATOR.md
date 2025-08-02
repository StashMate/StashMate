# Programmatic Transaction Simulator

This service provides a way to simulate transactions programmatically without requiring a UI. It's designed for testing, demonstrations, or development purposes.

## Overview

The transaction simulator allows you to:

- Generate random transactions (income or expense)
- Simulate specific transaction types (bank deposits, withdrawals, transfers, etc.)
- Associate transactions with specific accounts (bank or mobile money)
- Update account information when transactions are added

## How to Use

### Basic Usage

```typescript
import { createTransactionSimulator } from './services/programmaticTransactionSimulator';

// Create a simulator instance with the current user's ID
const simulator = createTransactionSimulator(userId);

// Simulate a single transaction
await simulator.simulateSingleTransaction(TransactionType.BankDeposit, accountId);

// Generate multiple random transactions
await simulator.generateRandomTransactions(5, accountId);
```

### Simulating Specific Transaction Types

The simulator provides convenience methods for common transaction types:

```typescript
// Bank transactions
await simulator.simulateBankDeposit(accountId);
await simulator.simulateBankWithdrawal(accountId);
await simulator.simulateBankTransfer(accountId);

// Mobile money transactions
await simulator.simulateMobileMoneyDeposit(accountId);
await simulator.simulateMobileMoneyWithdrawal(accountId);
await simulator.simulateMobileMoneyTransfer(accountId);
```

### Getting Account Information

The simulator can retrieve account information:

```typescript
// Get all bank accounts
const bankAccounts = await simulator.getBankAccounts();

// Get all mobile money accounts
const mobileMoneyAccounts = await simulator.getMobileMoneyAccounts();
```

## Example Implementation

See the `examples/transactionSimulationExample.ts` file for a complete example of how to use the transaction simulator.

## Integration with Existing Code

The simulator integrates with the existing transaction and account management systems:

- Transactions are stored in the appropriate Firestore collections
- Account information is updated when transactions are added
- The UI will automatically reflect new transactions through the existing context providers

## Notes

- This is a backend-only solution that doesn't require any UI components
- Transactions will appear in the app's transaction list and affect account balances
- Suitable for presentations where you need to demonstrate transaction functionality