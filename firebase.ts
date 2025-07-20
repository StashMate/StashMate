import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, serverTimestamp, setDoc, updateDoc, query, getDocs, Timestamp, where } from "firebase/firestore";
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
export const addTransaction = async (userId: string, transactionData: { name: string; amount: number; category: string; type: 'income' | 'expense' }) => {
  try {
    const transactionsCollectionRef = collection(db, 'transactions');
    await addDoc(transactionsCollectionRef, {
      ...transactionData,
      userId: userId,
      date: serverTimestamp(), // Use server timestamp for consistency
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
 * Gets all accounts for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{success: boolean, accounts?: any[], error?: any}>}
 */
export const getUserAccounts = async (userId: string) => {
  try {
    const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', userId));
    const snapshot = await getDocs(accountsQuery);
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, accounts };
  } catch (error: any) {
    console.error("Error fetching accounts:", error);
    return { success: false, error: "Failed to fetch accounts." };
  }
};

/**
 * Adds a new transaction with account association and recurring capability.
 * @param {string} userId - The ID of the user adding the transaction.
 * @param {object} transactionData - The transaction data.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const addTransactionWithAccount = async (userId: string, transactionData: { 
  name: string; 
  amount: number; 
  category: string; 
  type: 'income' | 'expense';
  accountId?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate?: Date;
}) => {
  try {
    const transactionsCollectionRef = collection(db, 'transactions');
    await addDoc(transactionsCollectionRef, {
      ...transactionData,
      userId: userId,
      date: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error adding transaction:", error);
    return { success: false, error: "Failed to add transaction. Please try again." };
  }
};

/**
 * Creates recurring transaction instances for due dates.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{success: boolean, created?: number, error?: any}>}
 */
export const createDueRecurringTransactions = async (userId: string) => {
  try {
    const now = new Date();
    const recurringQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('isRecurring', '==', true)
    );
    
    const snapshot = await getDocs(recurringQuery);
    let createdCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const transaction = { id: docSnapshot.id, ...docSnapshot.data() };
      const nextDueDate = transaction.nextDueDate?.toDate();
      
      if (nextDueDate && nextDueDate <= now) {
        // Create new transaction instance
        const newTransaction = {
          ...transaction,
          date: serverTimestamp(),
          createdAt: serverTimestamp(),
          isRecurring: false, // The instance is not recurring
          parentRecurringId: transaction.id, // Reference to the recurring template
        };
        
        // Remove fields that shouldn't be copied to instances
        delete newTransaction.id;
        delete newTransaction.nextDueDate;
        
        await addDoc(collection(db, 'transactions'), newTransaction);
        
        // Update the next due date for the recurring transaction
        const nextDue = calculateNextDueDate(nextDueDate, transaction.recurringFrequency);
        await updateDoc(doc(db, 'transactions', transaction.id), {
          nextDueDate: Timestamp.fromDate(nextDue)
        });
        
        createdCount++;
      }
    }
    
    return { success: true, created: createdCount };
  } catch (error: any) {
    console.error("Error creating recurring transactions:", error);
    return { success: false, error: "Failed to create recurring transactions." };
  }
};

/**
 * Helper function to calculate the next due date based on frequency.
 * @param {Date} currentDue - The current due date.
 * @param {string} frequency - The recurring frequency.
 * @returns {Date} The next due date.
 */
const calculateNextDueDate = (currentDue: Date, frequency: string): Date => {
  const nextDue = new Date(currentDue);
  
  switch (frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
    default:
      nextDue.setMonth(nextDue.getMonth() + 1); // Default to monthly
  }
  
  return nextDue;
};


export { app, auth, db, storage };

