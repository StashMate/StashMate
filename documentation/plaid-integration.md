
# Plaid Integration for StashMate

This document outlines the implementation of the Plaid integration for the StashMate app, which allows users to securely connect their bank accounts and automatically track their transactions.

## Overview

The Plaid integration enables StashMate to access a user's financial data with their permission. This is achieved through a combination of frontend and backend components:

- **Frontend (React Native):** The app uses the `react-native-plaid-link-sdk` to present the Plaid Link flow to the user. This is a secure and user-friendly way for users to connect their bank accounts.
- **Backend (Firebase Cloud Functions):** A set of Cloud Functions handles the communication with the Plaid API. This includes creating a link token, exchanging the public token for an access token, and receiving webhooks from Plaid when new transactions occur.

## Setup

To enable the Plaid integration, you will need to:

1.  **Create a Plaid Developer Account:** Sign up for a free developer account on the [Plaid website](https://plaid.com/).
2.  **Get API Keys:** Once you have a developer account, you will need to get your `client_id` and `secret` from the Plaid dashboard.
3.  **Configure Firebase:** Add your Plaid API keys to your Firebase project's environment variables. You can do this by running the following commands in your terminal:

    ```bash
    firebase functions:config:set plaid.client_id="YOUR_CLIENT_ID"
    firebase functions:config:set plaid.secret="YOUR_SECRET"
    ```

4.  **Deploy Cloud Functions:** Deploy the Cloud Functions to your Firebase project:

    ```bash
    firebase deploy --only functions
    ```

## How it Works

1.  **Linking an Account:**
    - The user initiates the account linking process by tapping the "Link Bank Account" button in the app.
    - The app calls the `createLinkToken` Cloud Function to get a link token from Plaid.
    - The Plaid Link flow is then presented to the user using the `react-native-plaid-link-sdk`.
    - The user selects their bank, enters their credentials, and grants permission for StashMate to access their data.

2.  **Exchanging the Public Token:**
    - Once the user has successfully linked their account, Plaid returns a public token to the app.
    - The app sends this public token to the `exchangePublicToken` Cloud Function.
    - The Cloud Function exchanges the public token for an access token and stores it securely in the user's Firestore document.

3.  **Receiving Transactions:**
    - Plaid sends a webhook to the `plaidWebhook` Cloud Function whenever there are new transactions for a linked account.
    - The Cloud Function retrieves the new transactions from Plaid and stores them in the `transactions` subcollection of the user's Firestore document.

4.  **Displaying Transactions:**
    - The `TransactionsScreen` in the app listens for real-time updates to the `transactions` collection.
    - When new transactions are added, the screen automatically updates to display them to the user.
