
# Dashboard Documentation

This document outlines the updated architecture of the dashboard, focusing on the introduction of the `useNetBalance` hook and the enhanced UI.

## 1. `useNetBalance` Hook

A new `useNetBalance` hook has been created to encapsulate the logic for calculating the net balance. This hook is responsible for:

- Fetching all of the user's financial accounts from Firestore.
- Fetching all of the user's transactions from Firestore.
- Calculating the net balance by summing up the initial balances of all accounts and the total income and expenses from all transactions.
- Providing the net balance, loading state, and error state to the `DashboardScreen` component.

### Usage

To use the hook, simply call it within the `DashboardScreen` component:

```tsx
import { useNetBalance } from '../../hooks/useNetBalance';

const DashboardScreen = () => {
  const { netBalance, loading, error } = useNetBalance();

  // Your component logic here
};
```

## 2. Enhanced UI

The dashboard UI has been enhanced to provide a clearer and more insightful financial overview:

- **Net Balance Card:** The net balance is now displayed in a dedicated card, with a clear distinction between positive and negative balances.
- **Last Updated Timestamp:** The net balance card now includes a "last updated" timestamp to indicate when the balance was last calculated.
