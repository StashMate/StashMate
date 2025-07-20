import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, serverTimestamp, setDoc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

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
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (lastLoginDate.toDateString() === yesterday.toDateString()) {
        await updateDoc(userDocRef, {
          streak: (userData.streak || 0) + 1,
          lastLogin: serverTimestamp(),
        });
      } else if (lastLoginDate.toDateString() !== today.toDateString()) {
        await updateDoc(userDocRef, {
          streak: 1,
          lastLogin: serverTimestamp(),
        });
      }
    } else {
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        streak: 1,
      });
    }

    return { success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName } };
  } catch (error: any) {
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
      });
      return { success: true, user: user, isNewUser: true };
    } else {
      // If the user already exists, update their streak and last login time
      const userData = userDocSnap.data();
      if (userData && userData.lastLogin) {
        const lastLoginDate = userData.lastLogin.toDate();
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (lastLoginDate.toDateString() === yesterday.toDateString()) {
          await updateDoc(userDocRef, {
            streak: (userData.streak || 0) + 1,
            lastLogin: serverTimestamp(),
          });
        } else if (lastLoginDate.toDateString() !== today.toDateString()) {
          await updateDoc(userDocRef, {
            streak: 1,
            lastLogin: serverTimestamp(),
          });
        }
      } else {
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          streak: 1,
        });
      }
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
export const addTransaction = async (
  userId: string, 
  transactionData: { 
    name: string; 
    amount: number; 
    category: string; 
    type: 'income' | 'expense';
    date?: Date;
    status?: 'completed' | 'pending' | 'scheduled';
    paymentMethod?: string;
  }
) => {
  try {
    const transactionsCollectionRef = collection(db, 'transactions');
    
    // Determine transaction status based on date
    const transactionDate = transactionData.date || new Date();
    const now = new Date();
    let status = transactionData.status;
    
    if (!status) {
      if (transactionDate > now) {
        status = 'scheduled';
      } else {
        status = 'completed';
      }
    }
    
    await addDoc(transactionsCollectionRef, {
      ...transactionData,
      userId: userId,
      date: transactionDate,
      status: status,
      createdAt: serverTimestamp(), // Track when the transaction was created
    });
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
    await updateDoc(transactionDocRef, updatedData);
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
    await addDoc(collection(db, 'accounts'), {
      userId,
      ...accountData,
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
    await addDoc(vaultsCollectionRef, {
      ...vaultData,
      currentAmount: 0,
      createdAt: serverTimestamp(),
    });
    return { success: true };
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
 * Calculates the net balance for a user across all linked accounts and transactions.
 * Net Balance = (Initial Account Balances + All Income) - All Expenses
 * 
 * @param {string} userId - The ID of the user
 * @param {boolean} includePending - Whether to include pending/future transactions (default: false)
 * @returns {Promise<{success: boolean, netBalance?: number, breakdown?: object, error?: any}>}
 */
export const calculateNetBalance = async (userId: string, includePending: boolean = false) => {
  try {
    // Fetch all user accounts
    const accountsSnapshot = await getDocs(
      query(collection(db, 'accounts'), where('userId', '==', userId))
    );
    
    // Calculate total initial account balances
    let totalAccountBalance = 0;
    const accountBalances: Array<{accountName: string, balance: number, institution: string}> = [];
    
    accountsSnapshot.docs.forEach(doc => {
      const accountData = doc.data();
      const balance = accountData.balance || 0;
      totalAccountBalance += balance;
      accountBalances.push({
        accountName: accountData.accountName || 'Unknown Account',
        balance: balance,
        institution: accountData.institution || 'Unknown Institution'
      });
    });

    // Fetch all user transactions
    let transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    // Add filter for pending/future transactions if not including them
    if (!includePending) {
      // Only include completed transactions
      transactionsQuery = query(
        transactionsQuery,
        where('status', '==', 'completed')
      );
    }

    const transactionsSnapshot = await getDocs(transactionsQuery);
    
    // Calculate income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;
    const incomeTransactions: Array<{name: string, amount: number, date: any}> = [];
    const expenseTransactions: Array<{name: string, amount: number, date: any}> = [];
    
    transactionsSnapshot.docs.forEach(doc => {
      const transaction = doc.data();
      const amount = transaction.amount || 0;
      const transactionType = transaction.type;
      
      // Skip transactions with invalid amounts
      if (isNaN(amount) || amount < 0) return;
      
      if (transactionType === 'income') {
        totalIncome += amount;
        incomeTransactions.push({
          name: transaction.name || 'Unknown Income',
          amount: amount,
          date: transaction.date
        });
      } else if (transactionType === 'expense') {
        totalExpenses += amount;
        expenseTransactions.push({
          name: transaction.name || 'Unknown Expense',
          amount: amount,
          date: transaction.date
        });
      }
    });

    // Calculate net balance
    // Net Balance = Initial Account Balances + Total Income - Total Expenses
    const netBalance = totalAccountBalance + totalIncome - totalExpenses;
    
    // Prepare detailed breakdown
    const breakdown = {
      totalAccountBalance,
      totalIncome,
      totalExpenses,
      netBalance,
      isNegative: netBalance < 0,
      accountBalances,
      incomeTransactions,
      expenseTransactions,
      transactionCounts: {
        income: incomeTransactions.length,
        expenses: expenseTransactions.length,
        total: incomeTransactions.length + expenseTransactions.length
      }
    };

    return {
      success: true,
      netBalance,
      breakdown
    };

  } catch (error: any) {
    console.error("Error calculating net balance:", error);
    return {
      success: false,
      error: "Failed to calculate net balance. Please try again."
    };
  }
};

/**
 * Formats a balance value with proper negative handling and currency display.
 * 
 * @param {number} balance - The balance amount to format
 * @param {boolean} showCurrency - Whether to show currency symbol (default: true)
 * @returns {string} Formatted balance string
 */
export const formatBalance = (balance: number, showCurrency: boolean = true): string => {
  const isNegative = balance < 0;
  const absoluteBalance = Math.abs(balance);
  const formattedAmount = absoluteBalance.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  const currencySymbol = showCurrency ? '$' : '';
  
  if (isNegative) {
    return `-${currencySymbol}${formattedAmount}`;
  }
  
  return `${currencySymbol}${formattedAmount}`;
};

/**
 * Gets a user-friendly status message for net balance.
 * 
 * @param {number} netBalance - The net balance amount
 * @returns {object} Status object with message and color indicator
 */
export const getNetBalanceStatus = (netBalance: number) => {
  if (netBalance < 0) {
    return {
      status: 'negative',
      message: 'You have more expenses than income and initial balance',
      color: '#FF6B6B', // Red color for negative
      icon: 'trending-down' as const
    };
  } else if (netBalance === 0) {
    return {
      status: 'neutral',
      message: 'Your income and expenses are balanced',
      color: '#FFA726', // Orange color for neutral
      icon: 'remove' as const
    };
  } else {
    return {
      status: 'positive',
      message: 'You have a positive net balance',
      color: '#4CAF50', // Green color for positive
      icon: 'trending-up' as const
    };
  }
};


export { app, auth, db, storage };

