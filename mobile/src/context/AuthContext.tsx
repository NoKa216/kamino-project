import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut as firebaseSignOut
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../lib/firebase';
import { authService } from '../services/auth.service';
import { User } from '../types/user.types';

// Interface defining the shape of the Authentication Context
interface AuthContextType {
    user: User | null;           // The current user object from the backend
    loading: boolean;           // Global loading state (splash screen)
    isFirstLaunch: boolean;     // Flag determining if Onboarding should be shown
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string, name: string) => Promise<void>;
    continueAsGuest: () => Promise<void>;
    logout: () => Promise<void>;

    /**
     * Manually triggers a user profile refresh from the backend.
     * Critical for Social Auth flows to ensure UI updates immediately after account creation.
     */
    refreshUser: () => Promise<void>;

    /**
     * Marks the onboarding tutorial as completed in persistent storage.
     * Updates the global state to trigger navigation to the main app/auth flow.
     */
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = useState(false);

    /**
     * Initialization Effect:
     * 1. Checks AsyncStorage for first-launch status.
     * 2. Sets up the Firebase Auth state listener.
     */
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Step 1: Check Onboarding Status
                const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
                setIsFirstLaunch(hasSeen === null);

                // Step 2: Listen for Firebase Auth changes
                onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        try {
                            // Get a fresh token to authenticate with our backend
                            const token = await firebaseUser.getIdToken();

                            // Sync with backend to get the full user profile (MongoDB/Firestore)
                            const response = await authService.login(token);
                            setUser(response.data.user);
                        } catch (error: any) {
                            // RACE CONDITION HANDLING:
                            // If we get a 404, it means the user exists in Firebase but not yet in our DB.
                            // This is expected during sign-up or social auth creation.
                            // We do NOT log out here; we wait for the creation function to update the state.
                            if (error.response?.status === 404) {
                                console.log("[AuthContext] User profile pending creation (Syncing...)");
                            } else {
                                console.error("[AuthContext] Sync failed, logging out:", error);
                                await firebaseSignOut(auth);
                                setUser(null);
                            }
                        }
                    } else {
                        setUser(null);
                    }
                    // Initialization complete, unmount Splash Screen
                    setLoading(false);
                });
            } catch (error) {
                console.error("[AuthContext] Initialization error:", error);
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    /**
     * Force refresh the user state.
     * Called explicitly after operations that modify the user (like Social Sign-Up)
     * to bypass the race condition.
     */
    const refreshUser = async () => {
        if (auth.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken(true); // Force refresh token
                const response = await authService.login(token);
                setUser(response.data.user);
            } catch (error) {
                console.error("[AuthContext] Failed to refresh user:", error);
            }
        }
    };

    /**
     * Persists the onboarding completion status and updates state.
     */
    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            setIsFirstLaunch(false); // Triggers immediate navigation via _layout.tsx
        } catch (error) {
            console.error("[AuthContext] Failed to save onboarding status:", error);
        }
    };

    const signUp = async (email: string, pass: string, name: string) => {
        // Create in Backend first, then authenticate in Firebase
        await authService.signup({ email, password: pass, fullName: name });
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signIn = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const continueAsGuest = async () => {
        const userCredential = await signInAnonymously(auth);
        const token = await userCredential.user.getIdToken();

        // Create the guest profile in Backend
        const response = await authService.anonymousAuth(token);

        // Update state manually to avoid waiting for the observer
        setUser(response.data.user || response.data);
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isFirstLaunch,
            signIn,
            signUp,
            continueAsGuest,
            logout,
            refreshUser,
            completeOnboarding
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);