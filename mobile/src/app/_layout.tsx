import { Stack, useRouter, useSegments } from 'expo-router';
import { LogBox, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import '../../global.css';

import { Loader } from '../components/ui/Loader';

LogBox.ignoreAllLogs(true);

function InitialLayout() {
    const { user, loading, isFirstLaunch } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';
        const inOnboarding = segments[0] === 'onboarding';
        // הוספנו זיהוי למסך היצירה
        const inCreate = segments[0] === 'create';

        if (isFirstLaunch && !inOnboarding) {
            router.replace('/onboarding');
        }
        // תנאי מתוקן: מאפשר להישאר אם המשתמש מחובר והוא ב-(app) או ב-create
        else if (!isFirstLaunch && user && !inAppGroup && !inCreate) {
            router.replace('/(app)');
        }
        else if (!isFirstLaunch && !user && !inAuthGroup) {
            router.replace('/(auth)/login');
        }
    }, [user?.uid, loading, isFirstLaunch, segments]);

    if (loading) return <Loader />;

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(app)" options={{ animation: 'fade' }} />

            {/* הגדרת המודל שיושב מעל הכל */}
            <Stack.Screen
                name="create"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    gestureEnabled: true
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar barStyle="light-content" backgroundColor="#050505" />
                <InitialLayout />
            </AuthProvider>
        </SafeAreaProvider>
    );
}