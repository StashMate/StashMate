 
# Savings Feature Logic

This document outlines the plan to transition the Savings feature from a static, single-account simulation to a dynamic, multi-account system backed by Firestore. This will allow users to link multiple bank and mobile money accounts and manage their savings across all of them.

## 1. Core Objectives

-   **Dynamic, Multi-Account System:** Replace the static, context-based data with a robust system that fetches and manages multiple user-linked accounts from Firestore.
-   **User-Specific Accounts:** Ensure users can only view and manage their own linked accounts.
-   **Seamless Account Switching:** Allow users to easily switch between their linked accounts to view their respective balances and savings vaults.
-   **Real-Time Balances:** Display real-time account balances.
-   **Improved UI/UX:** Enhance the user interface to be more intuitive, informative, and visually appealing.

## 2. Data Model

We will create a new `accounts` collection in Firestore to store linked financial accounts. Each document in this collection will follow this schema:

```json
{
  "userId": "string", // Foreign key to the users collection
  "accountName": "string", // e.g., "GT Bank Savings", "MTN Mobile Money"
  "accountType": "string", // "bank" or "mobileMoney"
  "balance": "number", // The current balance of the account
  "institution": "string", // e.g., "GT Bank", "MTN"
  "logoUrl": "string", // URL for the institution's logo
  "createdAt": "timestamp" // When the account was linked
}
```

We will also create a `vaults` sub-collection within each account document to store savings vaults specific to that account:

```json
// path: /accounts/{accountId}/vaults/{vaultId}
{
  "name": "string", // e.g., "Emergency Fund"
  "targetAmount": "number",
  "currentAmount": "number",
  "icon": "string", // Icon name for the vault
  "createdAt": "timestamp"
}
```

## 3. Feature Implementation

### 3.1. `linkBank.tsx` - Linking a New Account

1.  **Account Selection:**
    -   The user will select a bank or mobile money provider from the list.
    -   For this implementation, we will simulate a successful link without requiring actual credentials.

2.  **Saving to Firestore:**
    -   When a user "links" an account, a new document will be created in the `accounts` collection.
    -   This document will include the `userId`, a default `accountName`, the `accountType`, a simulated `balance`, the `institution` name, and a `logoUrl`.

### 3.2. `savings.tsx` - Displaying and Managing Accounts

1.  **Fetching Data:**
    -   Use a real-time listener (`onSnapshot`) to fetch all accounts from the `accounts` collection where the `userId` matches the currently logged-in user.
    -   The first account in the list will be set as the `selectedAccount` by default.

2.  **Account Switching:**
    -   The UI will display a horizontal list or a dropdown of all linked accounts.
    -   When a user selects an account, the `selectedAccount` state will be updated, and the displayed information (balance, vaults) will refresh.

3.  **Displaying Balances and Vaults:**
    -   The total savings card will show the `balance` of the `selectedAccount`.
    -   When an account is selected, another Firestore query will fetch the `vaults` from the sub-collection of that account document.
    -   The list of savings vaults will update to show the vaults associated with the `selectedAccount`.

### 3.3. `addVault.tsx` - Creating a New Savings Vault

1.  **Context-Aware Creation:**
    -   The "Create New Vault" button will be aware of the currently `selectedAccount`.
    -   When a user creates a new vault, it will be added to the `vaults` sub-collection of the `selectedAccount`.

## 4. UI/UX Enhancements

-   **Account Selector:**
    -   Redesign the account selector to be more visually engaging, possibly using cards with logos.
-   **Empty State:**
    -   If a user has no linked accounts, display a prominent call-to-action that directs them to the `linkBank` screen.
-   **Loading States:**
    -   Implement loading indicators to provide feedback while data is being fetched.

## 5. Nice-to-Have Features (Future Enhancements)

-   **Plaid Integration:**
    -   For a production app, integrate with a service like Plaid to securely link real bank accounts and fetch real-time transaction data.
-   **Transaction History per Account:**
    -   Display a list of recent transactions for the `selectedAccount`.
-   **Account De-linking:**
    -   Allow users to remove a linked account.

This plan provides a clear roadmap for transforming the Savings feature into a powerful, multi-account management tool. By leveraging Firestore for real-time data and creating a more intuitive UI, we can deliver a significantly more valuable experience for users. 