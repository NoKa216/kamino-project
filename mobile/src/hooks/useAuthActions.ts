import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema, AuthFormData } from '../schemas/authSchema';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

// 1. Import Google Sign-In and Firebase utilities
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth } from '../lib/firebase';
import { authService } from '../services/auth.service';

// 2. Google SDK Configuration
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: ['profile', 'email']
});

/**
 * Custom Hook: useAuthActions
 * Encapsulates all authentication logic, form handling, and side effects.
 */
export const useAuthActions = () => {
    const { signIn, signUp, continueAsGuest, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit, getValues, formState: { errors, isValid } } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        mode: 'onChange',
        defaultValues: { email: '', password: '', fullName: '' }
    });

    // ... (Login / SignUp / Forgot Password functions remain unchanged)
    const onLogin = handleSubmit(async (data) => {
        try {
            setIsLoading(true);
            await signIn(data.email, data.password);
        } catch (error: any) {
            Alert.alert("Login Failed", error.message);
        } finally {
            setIsLoading(false);
        }
    });

    const onSignUp = handleSubmit(async (data) => {
        try {
            setIsLoading(true);
            await signUp(data.email, data.password, data.fullName || '');
        } catch (error: any) {
            Alert.alert("Signup Failed", error.message);
        } finally {
            setIsLoading(false);
        }
    });

    const onForgotPassword = async () => {
        const email = getValues('email');
        if (!email) {
            Alert.alert("Required", "Please enter your email address first.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        try {
            setIsLoading(true);
            await authService.sendPasswordReset(email);
            Alert.alert("Check your inbox", `We sent a password reset link to ${email}.`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                Alert.alert("Account Not Found", "There is no account with this email.");
            } else {
                Alert.alert("Error", error.message || "Failed to send reset email.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handler for Google Sign-In.
     * UPDATED: Handles cancellation gracefully without alerts.
     */
    const onGoogleSignIn = async () => {
        try {
            setIsLoading(true);

            // Step 1: Verify Play Services and Perform Native Sign-In
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            const idToken = userInfo.data?.idToken;
            const googleUser = userInfo.data?.user;

            // FIX: If no token is found (e.g. user cancelled), do NOT throw an error.
            // Just log it and return so the UI stays consistent.
            if (!idToken) {
                console.log('Google Sign-In: No ID token found (User cancelled or config missing)');
                return; // <--- Stops execution here, preventing the "Catch" block alert
            }

            // Step 2: Authenticate with Firebase using the Google Credential
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);

            // Step 3: Backend Synchronization
            const firebaseToken = await userCredential.user.getIdToken();
            await authService.socialAuth(firebaseToken, googleUser?.name || undefined);

            // Step 4: Force Refresh Context
            await refreshUser();

        } catch (error: any) {
            // Handle explicit cancellation codes
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert("Error", "Google Play Services not available.");
            } else {
                // Real errors
                console.error('Google Sign-In Error:', error);
                Alert.alert("Google Login Failed", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ... (Apple Sign-In remains unchanged)
    const onAppleSignIn = async () => {
        try {
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert("Not Supported", "Apple Sign-In is not available on this device.");
                return;
            }

            setIsLoading(true);
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const { identityToken, fullName } = credential;
            if (!identityToken) throw new Error("No identity token provided.");

            const provider = new OAuthProvider('apple.com');
            const firebaseCredential = provider.credential({ idToken: identityToken });
            const userCredential = await signInWithCredential(auth, firebaseCredential);
            const firebaseToken = await userCredential.user.getIdToken();

            let name = undefined;
            if (fullName) {
                const given = fullName.givenName || '';
                const family = fullName.familyName || '';
                name = `${given} ${family}`.trim();
            }

            await authService.socialAuth(firebaseToken, name || undefined);
            await refreshUser();

        } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
                console.log("User canceled Apple Sign-In.");
            } else {
                console.error("Apple Sign-In Error:", error);
                Alert.alert("Sign-In Failed", "Could not complete Apple Sign-In.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        control,
        errors,
        isValid,
        onLogin,
        onSignUp,
        onSkip: continueAsGuest,
        onGoogleSignIn,
        onAppleSignIn,
        onForgotPassword,
    };
};