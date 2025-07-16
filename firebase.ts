import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
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


export { app, auth, db, storage };

