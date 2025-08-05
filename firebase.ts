import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { addNotification } from './services/notificationService';
import { checkAndAwardBadges, checkAndCompleteChallenges } from './services/gamificationService';
// import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

const Flutterwave = {
  publicKey: process.env.FLW_PUBLIC_KEY,
  secretKey: process.env.FLW_SECRET_KEY,
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Creates a new user with email and password, and stores their details in Firestore.
 * @param {string} fullName - The user's full name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's chosen password.
 * @returns {Promise<{success: boolean, user?: {uid: string, email: string | null, displayName: string | null}, error?: any}>}
 */
export const signUpWithEmail = async (fullName: string, email: string, password: string) => {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's profile with their full name
    await updateProfile(user, {
      displayName: fullName,
    });

    // Create a corresponding document in the 'users' collection in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: fullName,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      streak: 1,
      timezoneOffset: new Date().getTimezoneOffset(), // Store timezone offset at signup
    });

    // Return a success status and the user object
    return { success: true, user: { uid: user.uid, email: user.email, displayName: fullName } };
  } catch (error: any) {
    // Return a failure status and the error message
    return { success: false, error: error.message };
  }
};

/**
 * Signs a user in with their email and password.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<{success: boolean, user?: {uid: string, email: string | null, displayName: string | null}, error?: any}>}
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData && userData.lastLogin) {
      const lastLoginDate = userData.lastLogin.toDate();
      const userTimezoneOffset = userData.timezoneOffset || 0; // Default to 0 if not set

      const now = new Date();
      const todayLocal = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + userTimezoneOffset * 60000);
      const lastLoginLocal = new Date(lastLoginDate.getTime() + lastLoginDate.getTimezoneOffset() * 60000 + userTimezoneOffset * 60000);

      const todayStartOfDayLocal = new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate());
      const lastLoginStartOfDayLocal = new Date(lastLoginLocal.getFullYear(), lastLoginLocal.getMonth(), lastLoginLocal.getDate());

      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(Math.abs((todayStartOfDayLocal.getTime() - lastLoginStartOfDayLocal.getTime()) / oneDay));

      if (diffDays === 1) {
        // User logged in yesterday (local time), increment streak
        await updateDoc(userDocRef, {
          streak: (userData.streak || 0) + 1,
          lastLogin: serverTimestamp(),
        });
      } else if (diffDays > 1) {
        // User did not log in yesterday (local time), reset streak
        await updateDoc(userDocRef, {
          streak: 1,
          lastLogin: serverTimestamp(),
        });
      }
      // If diffDays is 0, user logged in today, do nothing (streak already updated or no need to update)
    } else {
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        streak: 1,
      });
    }

    await addNotification({
      userId: user.uid,
      type: 'info',
      title: 'Welcome Back!',
      message: `You have successfully logged in as ${user.displayName || user.email}.`,
    });
    return { success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName } };
  } catch (error: any){
    return { success: false, error: error.message };
  }
};

/**
 * Signs a user in with Google and manages their data in Firestore.
 * @param {string} id_token - The Google ID token obtained from the client-side flow.
 * @returns {Promise<object>} - An object containing the success status and the user object or an error.
 */
export const signInWithGoogle = async (id_token: string) => {
  try {
    // Create a Google credential with the token
    const credential = GoogleAuthProvider.credential(id_token);
    
    // Sign-in the user with the credential
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    // Check if the user exists in our Firestore database
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // If the user is new, create a new document for them
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        streak: 1,
        timezoneOffset: new Date().getTimezoneOffset(), // Store timezone offset at signup
      });
      await addNotification({
        userId: user.uid,
        type: 'info',
        title: 'Welcome to StashMate!',
        message: 'Your account has been successfully created.',
      });
      return { success: true, user: user, isNewUser: true };
    } else {
      // If the user already exists, update their streak and last login time
      const userData = userDocSnap.data();
      if (userData && userData.lastLogin) {
        const lastLoginDate = userData.lastLogin.toDate();
      const userTimezoneOffset = userData.timezoneOffset || 0; // Default to 0 if not set

      const now = new Date();
      const todayLocal = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + userTimezoneOffset * 60000);
      const lastLoginLocal = new Date(lastLoginDate.getTime() + lastLoginDate.getTimezoneOffset() * 60000 + userTimezoneOffset * 60000);

      const todayStartOfDayLocal = new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate());
      const lastLoginStartOfDayLocal = new Date(lastLoginLocal.getFullYear(), lastLoginLocal.getMonth(), lastLoginLocal.getDate());

      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(Math.abs((todayStartOfDayLocal.getTime() - lastLoginStartOfDayLocal.getTime()) / oneDay));

      if (diffDays === 1) {
        // User logged in yesterday (local time), increment streak
        await updateDoc(userDocRef, {
          streak: (userData.streak || 0) + 1,
          lastLogin: serverTimestamp(),
        });
      } else if (diffDays > 1) {
        // User did not log in yesterday (local time), reset streak
        await updateDoc(userDocRef, {
          streak: 1,
          lastLogin: serverTimestamp(),
        });
      }
      // If diffDays is 0, user logged in today, do nothing (streak already updated or no need to update)
      } else {
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          streak: 1,
        });
      }
      await addNotification({
        userId: user.uid,
        type: 'info',
        title: 'Welcome Back!',
        message: `You have successfully logged in as ${user.displayName || user.email}.`,
      });
      return { success: true, user: user, isNewUser: false };
    }
  } catch (error: any) {
    // Return a failure status and the error message
    console.error("Error during Google Sign-In:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Adds a new transaction document to Firestore for a specific user.
 * @param {string} userId - The ID of the user adding the transaction.
 * @param {object} transactionData - The transaction data.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const addTransaction = async (userId: string, transactionData: { name: string; amount: number; category: string; type: 'income' | 'expense' }) => {
  try {
    const transactionsCollectionRef = collection(db, 'transactions');
    await addDoc(transactionsCollectionRef, {
      ...transactionData,
      userId: userId,
      date: serverTimestamp(), // Use server timestamp for consistency
    });
    // Trigger gamification checks after adding a transaction
    await checkAndAwardBadges(userId);
    await checkAndCompleteChallenges(userId);
    return { success: true };
  } catch (error: any) {
    console.error("Error adding transaction:", error);
    return { success: false, error: "Failed to add transaction. Please try again." };
  }
};

/**
 * Updates an existing transaction document in Firestore.
 * @param {string} transactionId - The ID of the transaction to update.
 * @param {object} updatedData - The data to update.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateTransaction = async (transactionId: string, updatedData: any) => {
  try {
    const transactionDocRef = doc(db, 'transactions', transactionId);
    // Handle refunds: if type is expense and amount is negative, treat as refund
    if (updatedData.type === 'expense' && updatedData.amount < 0) {
      // You might want to store this as a separate type or flag, e.g., { type: 'refund', originalExpenseId: transactionId }
      // For now, we'll just allow negative expense amounts to deduct from total expenses.
      // No special handling needed here other than allowing the update.
    }
    await updateDoc(transactionDocRef, updatedData);
    // Trigger gamification checks after updating a transaction
    await checkAndAwardBadges(updatedData.userId); // Assuming userId is available in updatedData or can be fetched
    await checkAndCompleteChallenges(updatedData.userId); // Assuming userId is available in updatedData or can be fetched
    return { success: true };
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    return { success: false, error: "Failed to update transaction. Please try again." };
  }
};

/**
 * Deletes a transaction document from Firestore.
 * @param {string} transactionId - The ID of the transaction to delete.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteTransaction = async (transactionId: string) => {
  try {
    const transactionDocRef = doc(db, 'transactions', transactionId);
    await deleteDoc(transactionDocRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Failed to delete transaction. Please try again." };
  }
};

/**
 * Updates a user's profile information in both Firebase Auth and Firestore.
 * @param {string} userId - The ID of the user to update.
 * @param {object} updatedData - The data to update (e.g., { displayName: "New Name" }).
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateUserProfile = async (userId: string, updatedData: { displayName?: string; bio?: string; photoURL?: string | null; }) => {
  try {
    const user = auth.currentUser;
    if (user && user.uid === userId) {
      // Update Firebase Auth profile
      const authUpdate: { displayName?: string; photoURL?: string } = {};
      if (updatedData.displayName) {
        authUpdate.displayName = updatedData.displayName;
      }
      if (updatedData.photoURL) {
        authUpdate.photoURL = updatedData.photoURL;
      } else if (updatedData.photoURL === null) {
        authUpdate.photoURL = undefined;
      }

      if (Object.keys(authUpdate).length > 0) {
        await updateProfile(user, authUpdate);
      }

      // Update Firestore user document
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, updatedData);

      return { success: true };
    }
    throw new Error("User not found or mismatch.");
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
};

/**
 * Links a new financial account to the user's profile.
 * @param {string} userId - The ID of the user linking the account.
 * @param {object} accountData - The data for the new account.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const linkAccount = async (userId: string, accountData: { accountName: string; accountType: string; balance: number; institution: string; logoUrl: string; }) => {
  try {
    const randomBalance = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
    await addDoc(collection(db, 'accounts'), {
      userId,
      ...accountData,
      balance: randomBalance,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error linking account:", error);
    return { success: false, error: "Failed to link account." };
  }
};

/**
 * Adds a new savings vault to a specific account.
 * @param {string} accountId - The ID of the account to add the vault to.
 * @param {object} vaultData - The data for the new vault.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const addVault = async (accountId: string, vaultData: { name: string; targetAmount: number; icon: string; deadline: Date; }) => {
  try {
    const vaultsCollectionRef = collection(db, 'accounts', accountId, 'vaults');
    const existingVaultsSnapshot = await getDocs(vaultsCollectionRef);

    const docRef = await addDoc(vaultsCollectionRef, {
      ...vaultData,
      accountId: accountId, // Add accountId to the vault document
      deadline: Timestamp.fromDate(vaultData.deadline),
      currentAmount: 0,
      createdAt: serverTimestamp(),
    });

    if (existingVaultsSnapshot.empty) {
      // This is the user's first vault, send a notification
      await addNotification({
        userId: accountId, // Assuming accountId is equivalent to userId for notifications
        type: 'info',
        title: 'First Vault Created!',
        message: `Congratulations! You've created your first savings vault: ${vaultData.name}.`,
      });
    }
    return { success: true, vaultId: docRef.id };
  } catch (error: any) {
    console.error("Error adding vault:", error);
    return { success: false, error: "Failed to add vault." };
  }
};

/**
 * Updates an existing savings vault.
 * @param {string} accountId - The ID of the account containing the vault.
 * @param {string} vaultId - The ID of the vault to update.
 * @param {object} updatedData - The data to update.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const updateVault = async (accountId: string, vaultId: string, updatedData: any) => {
  try {
    const vaultDocRef = doc(db, 'accounts', accountId, 'vaults', vaultId);
    await updateDoc(vaultDocRef, updatedData);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating vault:", error);
    return { success: false, error: "Failed to update vault." };
  }
};

/**
 * Deletes a savings vault from an account.
 * @param {string} accountId - The ID of the account containing the vault.
 * @param {string} vaultId - The ID of the vault to delete.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteVault = async (accountId: string, vaultId: string) => {
  try {
    const vaultDocRef = doc(db, 'accounts', accountId, 'vaults', vaultId);
    await deleteDoc(vaultDocRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting vault:", error);
    return { success: false, error: "Failed to delete vault." };
  }
};

/**
 * Makes a deposit to a savings vault by updating the current amount.
 * @param {string} accountId - The ID of the account containing the vault.
 * @param {string} vaultId - The ID of the vault to deposit to.
 * @param {number} amount - The amount to deposit.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const addVaultDeposit = async (accountId: string, vaultId: string, amount: number) => {
  try {
    const vaultDocRef = doc(db, 'accounts', accountId, 'vaults', vaultId);
    const vaultDoc = await getDoc(vaultDocRef);
    
    if (!vaultDoc.exists()) {
      return { success: false, error: "Vault not found." };
    }
    
    const currentData = vaultDoc.data();
    const newAmount = (currentData.currentAmount || 0) + amount;
    
    await updateDoc(vaultDocRef, {
      currentAmount: newAmount,
      lastDeposit: {
        amount: amount,
        timestamp: serverTimestamp(),
      }
    });

    const accountDoc = await getDoc(doc(db, 'accounts', accountId));
    const accountData = accountDoc.data();
    if (accountData && accountData.userId) {
        await checkAndAwardBadges(accountData.userId);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error making deposit:", error);
    return { success: false, error: "Failed to make deposit." };
  }
};

/*
 * Gets savings analytics for a specific account.
 * @param {string} accountId - The ID of the account to analyze.
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */



/**
 * Deletes a budget item for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {string} budgetItemId - The ID of the budget item to delete.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const deleteBudgetItem = async (userId: string, budgetItemId: string) => {
  try {
    const budgetItemDocRef = doc(db, 'users', userId, 'budgets', budgetItemId);
    await deleteDoc(budgetItemDocRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting budget item:", error);
    return { success: false, error: "Failed to delete budget item." };
  }
};

/**
 * Fetches all savings vaults for a specific account.
 * @param {string} accountId - The ID of the account to fetch vaults for.
 * @returns {Promise<{success: boolean, data?: any[], error?: any}>}
 */
export const getVaultsForAccount = async (accountId: string) => {
  try {
    const vaultsCollectionRef = collection(db, 'accounts', accountId, 'vaults');
    const q = query(vaultsCollectionRef);
    const querySnapshot = await getDocs(q);
    const vaults = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: vaults };
  } catch (error: any) {
    console.error("Error fetching vaults for account:", error);
    return { success: false, error: "Failed to fetch vaults." };
  }
};

/*
 * Gets savings analytics for a specific account.
 * @param {string} accountId - The ID of the account to analyze.
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const getSavingsAnalytics = async (accountId: string) => {
  try {
    const vaultsCollectionRef = collection(db, 'accounts', accountId, 'vaults');
    const vaultsSnapshot = await getDocs(vaultsCollectionRef);
    
    let totalSaved = 0;
    let totalTarget = 0;
    let completedVaults = 0;
    let activeVaults = 0;
    
    vaultsSnapshot.docs.forEach(doc => {
      const vault = doc.data();
      totalSaved += vault.currentAmount || 0;
      totalTarget += vault.targetAmount || 0;
      
      if (vault.currentAmount >= vault.targetAmount) {
        completedVaults++;
      } else {
        activeVaults++;
      }
    });
    
    const savingsRate = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    
    return {
      success: true,
      data: {
        totalSaved,
        totalTarget,
        savingsRate,
        completedVaults,
        activeVaults,
        totalVaults: vaultsSnapshot.size
      }
    };
  } catch (error: any) {
    console.error("Error getting analytics:", error);
    return { success: false, error: "Failed to get analytics." };
  }
};






import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

/**
 * Uploads an image to Firebase Storage and returns its download URL.
 * @param {string} uri - The local URI of the image.
 * @param {string} storagePath - The path in Firebase Storage where the image will be stored (e.g., 'profile_pictures/userId.jpg').
 * @returns {Promise<{success: boolean, url?: string, error?: any}>}
 */


/**
 * Links a bank account using Paystack's account verification API.
 * @param {string} userId - The ID of the user linking the account.
 * @param {object} accountData - The data for the account to link.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const linkAccountWithPaystack = async (userId: string, accountData: { accountNumber: string; bankCode: string; bankName: string }) => {
  try {
    // First, verify the account with Paystack
    const verificationResult = await verifyBankAccount(accountData.accountNumber, accountData.bankCode);
    
    if (!verificationResult.success) {
      return { success: false, error: verificationResult.error || "Could not verify account" };
    }
    
    // If verification is successful, store the account details
    await addDoc(collection(db, 'accounts'), {
      userId,
      accountName: verificationResult.data.account_name,
      accountNumber: accountData.accountNumber,
      bankCode: accountData.bankCode,
      bankName: accountData.bankName,
      balance: 0, // Initial balance, will be updated by transaction sync
      institution: accountData.bankName,
      logoUrl: "", // You can add bank logos if available
      createdAt: serverTimestamp(),
      lastSynced: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error linking account with Paystack:", error);
    return { success: false, error: "Failed to link account." };
  }
};

/**
 * Verifies a bank account using Paystack's API.
 * @param {string} accountNumber - The account number to verify.
 * @param {string} bankCode - The bank code.
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const verifyBankAccount = async (accountNumber: string, bankCode: string) => {
  try {
    // This would typically be a server-side call to protect your API key
    // For demo purposes, we're showing how it would work
    // In production, you should create a Cloud Function to handle this
    
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.status) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error: any) {
    console.error("Error verifying bank account:", error);
    return { success: false, error: "Failed to verify account." };
  }
};

/**
 * Fetches the list of banks from Paystack's API.
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export const fetchBanks = async () => {
  try {
    // This would typically be a server-side call to protect your API key
    // For demo purposes, we're showing how it would work
    // In production, you should create a Cloud Function to handle this
    
    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.status) {
      // Transform the data to match our expected format
      const banks = result.data.map((bank: any) => ({
        id: bank.id.toString(),
        name: bank.name,
        code: bank.code,
        // Add logo if available
      }));
      
      return { success: true, data: banks };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error: any) {
    console.error("Error fetching banks:", error);
    return { success: false, error: "Failed to fetch banks." };
  }
};

/**
 * Syncs transactions for a linked account using Paystack's API.
 * @param {string} userId - The ID of the user.
 * @param {string} accountId - The ID of the linked account.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const syncTransactions = async (userId: string, accountId: string) => {
  try {
    // Get the account details
    const accountDocRef = doc(db, 'accounts', accountId);
    const accountDoc = await getDoc(accountDocRef);
    
    if (!accountDoc.exists()) {
      return { success: false, error: "Account not found." };
    }
    
    const accountData = accountDoc.data();
    const lastSynced = accountData.lastSynced?.toDate() || new Date(0); // Default to epoch if never synced
    
    // In a real implementation, you would call Paystack's API to get transactions
    // For this demo, we'll simulate fetching transactions
    // This would typically be done in a Cloud Function to protect your API keys
    
    // Simulate new transactions (in a real app, these would come from Paystack's API)
    const newTransactions = [
      {
        id: `trans_${Date.now()}_1`,
        amount: 5000, // Amount in smallest currency unit (e.g., kobo for NGN)
        currency: "NGN",
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
    const batch = writeBatch(db);
    
    newTransactions.forEach(transaction => {
      const transactionRef = doc(collection(db, 'transactions'));
      batch.set(transactionRef, {
        ...transaction,
        userId,
        accountId,
        synced: true,
        createdAt: serverTimestamp()
      });
    });
    
    // Update the last synced timestamp
    batch.update(accountDocRef, {
      lastSynced: serverTimestamp()
    });
    
    await batch.commit();
    
    // Trigger gamification checks
    await checkAndAwardBadges(userId);
    await checkAndCompleteChallenges(userId);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error syncing transactions:", error);
    return { success: false, error: "Failed to sync transactions." };
  }
};



/**
 * Uploads an image to Firebase Storage and returns its download URL.
 * @param {string} uri - The local URI of the image.
 * @param {string} storagePath - The path in Firebase Storage where the image will be stored (e.g., 'profile_pictures/userId.jpg').
 * @returns {Promise<{success: boolean, url?: string, error?: any}>}
 */
export const uploadImageAndGetURL = async (uri: string, storagePath: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, storagePath);
    const uploadTask = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(uploadTask.ref);
    return { success: true, url: downloadURL };
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return { success: false, error: error.message };
  }
};
export { app, auth, db, storage };
