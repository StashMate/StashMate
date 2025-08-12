// Add these functions to your existing functions/index.ts file
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import fetch from "node-fetch";

admin.initializeApp();

export const verifyBankAccount = functions.https.onCall(async (data, context) => {
 
  const { accountNumber, bankCode } = data;

  try {
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${functions.config().paystack.secret_key}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (result.status) {
      return { success: true, data: result.data };
    } else {
      throw new functions.https.HttpsError("invalid-argument", result.message);
    }
  } catch (error) {
    console.error("Error verifying bank account:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to verify account."
    );
  }
});

export const fetchBanks = functions.https.onCall(async (data, context) => {
  try {
    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${functions.config().paystack.secret_key}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.status) {
      // Transform the data to match our expected format
      const banks = result.data.map((bank: any) => ({
        id: bank.id.toString(),
        name: bank.name,
        code: bank.code,
      }));

      return { success: true, data: banks };
    } else {
      throw new functions.https.HttpsError("internal", result.message);
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch banks.");
  }
});

export const syncTransactions = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const userId = context.auth.uid;
  const { accountId } = data;

  try {
    // Get the account details
    const accountDoc = await admin.firestore().collection("accounts").doc(accountId).get();

    if (!accountDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Account not found.");
    }

    const accountData = accountDoc.data();
    
    // In a real implementation, you would call Paystack's API to get transactions
    // For this demo, we'll simulate fetching transactions
    
    // Simulate new transactions (in a real app, these would come from Paystack's API)
    const newTransactions = [
      {
        id: `trans_${Date.now()}_1`,
        amount: 5000, // Amount in smallest currency unit (e.g., kobo for NGN)
        currency: "GH",
        date: new Date(),
        description: "Grocery shopping",
        category: "Groceries",
        type: "expense"
      },
      {
        id: `trans_${Date.now()}_2`,
        amount: 10000,
        currency: "NGN",
        date: new Date(),
        description: "Salary payment",
        category: "Income",
        type: "income"
      }
    ];
    
    // Add the transactions to Firestore
    const batch = admin.firestore().batch();
    
    newTransactions.forEach(transaction => {
      const transactionRef = admin.firestore().collection("transactions").doc();
      batch.set(transactionRef, {
        ...transaction,
        userId,
        accountId,
        synced: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    // Update the last synced timestamp
    batch.update(accountDoc.ref, {
      lastSynced: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    console.error("Error syncing transactions:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to sync transactions."
    );
  }
});
