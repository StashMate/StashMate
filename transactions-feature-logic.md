# Transactions Feature Logic

This document outlines the logic for the dynamic transactions feature in the StashMate application.

## Data Source

- **Source**: Transactions are stored and fetched from the `transactions` collection in Firestore.
- **Real-time**: The page uses a real-time listener (`onSnapshot`) to automatically update the UI when transaction data changes in the database.

## Data Structure

Each transaction document in the `transactions` collection has the following structure:

```typescript
interface Transaction {
  id: string;          // Document ID from Firestore
  userId: string;        // ID of the user who owns the transaction
  name: string;          // Name of the transaction (e.g., "Coffee", "Paycheck")
  amount: number;        // The transaction amount
  category: string;      // Category of the transaction (e.g., "Food", "Salary")
  type: 'income' | 'expense'; // Type of the transaction
  date: Timestamp;       // Firestore Timestamp of when the transaction occurred
}
```

## Data Fetching and State Management

- **State**: The component manages the following state variables:
  - `transactions`: An array to hold the list of fetched transactions.
  - `loading`: A boolean to track the initial data loading state.
  - `error`: A string to store any error messages that occur during data fetching.
  - `filter`: A string (`'All'`, `'Income'`, or `'Expenses'`) to filter the displayed transactions.
  - `searchQuery`: A string to filter transactions based on user input.

- **Fetching**:
  - An effect (`useEffect`) is used to fetch data when the component mounts or the user changes.
  - A Firestore query fetches transactions from the `transactions` collection where the `userId` matches the currently authenticated user's ID.
  - The transactions are ordered by `date` in descending order.

## UI Rendering and User Experience

- **Loading State**: A loading indicator is displayed while the initial data is being fetched.
- **Error Handling**: If an error occurs (e.g., missing Firestore index), a descriptive error message is shown to the user with instructions on how to resolve it.
- **Empty State**: If the user has no transactions, a message is displayed prompting them to add one.
- **Transaction List**:
  - A `FlatList` is used for efficient rendering of the transaction list.
  - Transactions are grouped by date to improve readability.
- **Filtering and Searching**: Users can filter transactions by type (All, Income, Expenses) and search by name or category.
- **Summary**: A summary section displays the total income, total expenses, and the net flow for the filtered period.
- **Add Transaction**: A Floating Action Button (FAB) allows users to navigate to the `addTransaction` screen to easily add new transactions. 