import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema, AuthFormData } from '../schemas/authSchema';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

// 1. Import Google Sign-In and Firebase utilities
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { authService } from '../services/auth.service';

// 2. Google SDK Configuration
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: ['profile', 'email']
});

/**
 * Hook to manage authentication actions (Login, SignUp, Social).
 * Separates UI logic from business/auth logic.
 */
export const useAuthActions = () => {
    // Destructure actions from context, including the manual refresh
    const { signIn, signUp, continueAsGuest, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Initialize Form Control
    const { control, handleSubmit, formState: { errors, isValid } } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        mode: 'onChange',
        defaultValues: { email: '', password: '', fullName: '' }
    });

    // ... (onLogin and onSignUp remain the same) ...
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

    // =============================================================================
    // SOCIAL AUTH: GOOGLE IMPLEMENTATION
    // =============================================================================
    /**
     * Handles the full Google Sign-In flow:
     * 1. Native SDK Sign-In
     * 2. Firebase Authentication
     * 3. Backend Synchronization (User Creation)
     * 4. Context Refresh
     */
    const onGoogleSignIn = async () => {
        try {
            setIsLoading(true);

            // Step 1: Native Check & Sign In
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            const idToken = userInfo.data?.idToken;
            const googleUser = userInfo.data?.user;

            if (!idToken) throw new Error('No ID token found from Google');

            // Step 2: Firebase Authentication
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);

            // Step 3: Backend Synchronization
            // Get fresh token to authorize backend request
            const firebaseToken = await userCredential.user.getIdToken();

            // Send to backend to create/update user profile in Firestore
            await authService.socialAuth(firebaseToken, googleUser?.name || undefined);

            // Step 4: Critical Context Update
            // Manually refresh the user in AuthContext to update UI immediately
            await refreshUser();

        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert("Error", "Google Play Services not available.");
            } else {
                console.error('Google Sign-In Error:', error);
                Alert.alert("Google Login Failed", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onAppleSignIn = async () => {
        Alert.alert("Coming Soon", "Apple Sign-In integration is in progress.");
    };

    const onFacebookSignIn = async () => {
        Alert.alert("Coming Soon", "Facebook Sign-In integration is in progress.");
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
        onFacebookSignIn
    };
};