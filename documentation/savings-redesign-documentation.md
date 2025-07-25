
# Savings Page Redesign Documentation

This document outlines the redesigned architecture of the savings feature, focusing on the introduction of the `SavingsContext`, updated Firebase functions, and the refactored `SavingsScreen` component.

## 1. `SavingsContext.tsx`

A new `SavingsContext` has been created to manage all savings-related data and logic. This context is responsible for:

- Fetching the user's financial accounts from Firestore.
- Fetching the savings vaults for the selected account.
- Providing the accounts, vaults, loading state, and the selected account to the `SavingsScreen` component.

### Usage

To use the context, wrap the component that needs access to the savings data with the `SavingsProvider`:

```tsx
import { SavingsProvider } from './context/SavingsContext';

const App = () => {
  return (
    <SavingsProvider>
      {/* Your components */}
    </SavingsProvider>
  );
};
```

Then, within the component, use the `useSavings` hook to access the data:

```tsx
import { useSavings } from './context/SavingsContext';

const SavingsScreen = () => {
  const { accounts, vaults, loading, selectedAccount, setSelectedAccount } = useSavings();

  // Your component logic here
};
```

## 2. `firebase.ts` Updates

Two new functions have been added to `firebase.ts` to fetch savings-related data:

- `getAccounts(userId: string)`: Fetches all financial accounts for a given user.
- `getVaults(accountId: string)`: Fetches all savings vaults for a specific account.

These functions are used by the `SavingsContext` to fetch the necessary data from Firestore.

## 3. `SavingsScreen` Refactor

The `SavingsScreen` component has been refactored to use the `SavingsContext`. This has several benefits:

- **Cleaner Code:** The component is now focused on presentation, with all data-fetching and state management handled by the context.
- **Improved Performance:** The context uses `onSnapshot` listeners to automatically update the UI when data changes in Firestore, ensuring the data is always up-to-date.
- **Better User Experience:** The screen now includes a loading skeleton, a "pull-to-refresh" feature, and a more interactive and visually appealing design.

## 4. New Design

The savings page has been redesigned with a more modern and user-friendly interface:

- **Account Cards:** Financial accounts are now displayed as horizontal scrollable cards, making it easy to switch between them.
- **Vault Cards:** Savings vaults are displayed in a vertical list, with progress bars and clear calls to action.
- **Empty States:** The screen now has clear empty states for when the user has no linked accounts or savings vaults.
- **Floating Action Button:** A floating action button has been added to make it easier to create new savings vaults.
