import { Stack, useRouter, useSegments } from 'expo-router';
import { LogBox, View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import '../../global.css';

// =============================================================================
// LOGBOX CONFIGURATION
// =============================================================================
// Suppress known non-critical warnings from dependencies
LogBox.ignoreLogs([
    '[Reanimated] Reading from `value` during component render',
    '[Reanimated] Writing to `value` during component render',
    'SafeAreaView has been deprecated',
]);

/**
 * InitialLayout: The Navigation Guard.
 * Observes global auth state and redirects user to the appropriate screen.
 */
function InitialLayout() {
    const { user, loading, isFirstLaunch } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    /**
     * Main Navigation Effect
     * Reacts to changes in user authentication or first-launch status.
     */
    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';
        const inOnboarding = segments[0] === 'onboarding';

        // Case 1: First time launching the app -> Force Onboarding
        if (isFirstLaunch && !inOnboarding) {
            router.replace('/onboarding');
        }
        // Case 2: User is authenticated -> Redirect to Main App
        else if (!isFirstLaunch && user && !inAppGroup) {
            router.replace('/(app)');
        }
        // Case 3: User is NOT authenticated -> Redirect to Login
        else if (!isFirstLaunch && !user && !inAuthGroup) {
            router.replace('/(auth)/login');
        }
    }, [user?.uid, loading, isFirstLaunch, segments]); // Dependencies ensure immediate reaction

    // Show a clean loading screen while Auth Context initializes
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
                <ActivityIndicator size="large" color="#A78BFA" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar barStyle="light-content" />
                <InitialLayout />
            </AuthProvider>
        </SafeAreaProvider>
    );
}