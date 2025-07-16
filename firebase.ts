import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    getReactNativePersistence,
    GoogleAuthProvider,
    initializeAuth,
    signInWithCredential,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
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

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

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
    });

    // Return a success status and the user object
    return { success: true, user: { uid: user.uid, email: user.email, displayName: fullName } };
  } catch (error) {
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

    // Update last login time
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp(),
    });

    return { success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName } };
  } catch (error) {
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
      });
      return { success: true, user: user, isNewUser: true };
    } else {
      // If the user already exists, just update their last login time
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
      });
      return { success: true, user: user, isNewUser: false };
    }
  } catch (error) {
    // Return a failure status and the error message
    console.error("Error during Google Sign-In:", error);
    return { success: false, error: error.message };
  }
};

export { app, auth, db, storage };

