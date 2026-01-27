import { Stack, useRouter, useSegments } from 'expo-router';
import { LogBox, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '../../global.css';
import { Loader } from '../components/ui/Loader';


LogBox.ignoreAllLogs(true);

// React Query client with sensible defaults for mobile
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
            refetchOnWindowFocus: false, // Not needed for mobile
        },
    },
});

function InitialLayout() {
    const { user, loading, isFirstLaunch } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';
        const inOnboarding = segments[0] === 'onboarding';
        const inCreate = segments[0] === 'create';
        const inGenerating = segments[0] === 'generating';

        if (isFirstLaunch && !inOnboarding) {
            router.replace('/onboarding');
        }
        else if (!isFirstLaunch && user && !inAppGroup && !inCreate && !inGenerating) {
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
            <Stack.Screen
                name="create"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    gestureEnabled: true
                }}
            />
            <Stack.Screen
                name="generating"
                options={{
                    headerShown: false,
                    presentation: 'fullScreenModal',
                    animation: 'fade'
                }}
            />
        </Stack>
    );
}


export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <AuthProvider>
                        <StatusBar barStyle="light-content" backgroundColor="#050505" />
                        <InitialLayout />
                    </AuthProvider>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}