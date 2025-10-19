// src/services/auth.ts
'use client'

import { 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addUser, checkUserExistsInRole } from './firestore';

export const signIn = async (email, password, role) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user) {
        const userExistsInRole = await checkUserExistsInRole(user.email, role);
        if (!userExistsInRole) {
            await firebaseSignOut(auth); // Sign out the user if they don't have the correct role
            throw new Error('USER_NOT_FOUND_IN_ROLE');
        }
    }
    
    return userCredential;
}

export const signOut = () => {
    return firebaseSignOut(auth);
}

export const onAuthStateChangeObserver = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
}