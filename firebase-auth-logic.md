# Firebase Authentication Logic

This document outlines the logic for handling user authentication via Firebase, covering both email/password sign-up and Google Sign-In.

## 1. Email/Password Sign-Up

This function handles the process of registering a new user with their full name, email, and password.

### Logic Flow:

1.  **Receive User Details**: The function accepts `fullName`, `email`, and `password` from the sign-up form.
2.  **Create Firebase User**: It uses `createUserWithEmailAndPassword` to create a new user account in Firebase Authentication.
3.  **Update User Profile**: After successful creation, it updates the new user's Firebase profile to include their `displayName` (the full name).
4.  **Create Firestore Document**: A new document is created in the "users" collection in Firestore. This document stores the user's `uid`, `email`, `displayName`, and a `createdAt` timestamp. This is useful for storing additional user-specific data later on.
5.  **Return User Data**: The function returns the newly created user object, which can then be used to set the user state in the app and navigate to a welcome screen or dashboard.

### Code Implementation (`firebase.ts`):

```typescript
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase'; // Assuming auth and db are exported from your firebase config

/**
 * Creates a new user with email and password, and stores their details in Firestore.
 * @param {string} fullName - The user's full name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's chosen password.
 * @returns {Promise<object>} - An object containing the success status and the user object or an error.
 */
export const signUpWithEmail = async (fullName, email, password) => {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's profile with their full name
    await updateProfile(user, {
      displayName: fullName,
    });

    // Create a corresponding document in the 'users' collection in Firestore
    await setDoc(doc(db, 'users', user.uid), {
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
```

## 2. Google Sign-In

This function handles the entire process of authenticating a user with their Google account.

### Logic Flow:

1.  **Receive ID Token**: This function accepts a Google `id_token`, which is obtained from the front-end using a library like `expo-auth-session`.
2.  **Create Firebase Credential**: It creates a Firebase credential using the provided `id_token`.
3.  **Sign In with Credential**: It signs the user into Firebase using the credential. This will automatically create a new user in Firebase Authentication if they don't already exist.
4.  **Check for Existing User in Firestore**: It checks if a document for this user already exists in the "users" collection.
5.  **Create or Update Firestore Document**:
    *   If the user is new, it creates a new document with their details.
    *   If the user already exists, it simply updates their `lastLogin` timestamp.
6.  **Return User Data**: The function returns the user object along with a flag indicating if they are a new user. This is useful for routing them to an onboarding flow if needed.

### Code Implementation (`firebase.ts`):

```typescript
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase'; // Assuming auth and db are exported from your firebase config

/**
 * Signs a user in with Google and manages their data in Firestore.
 * @param {string} id_token - The Google ID token obtained from the client-side flow.
 * @returns {Promise<object>} - An object containing the success status and the user object or an error.
 */
export const signInWithGoogleToken = async (id_token) => {
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
``` 