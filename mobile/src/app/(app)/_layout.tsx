import { Stack } from 'expo-router';

/**
 * App Group Layout
 * Simplified to a basic Stack navigator.
 * This removes the requirement for 'create' and 'profile' tab files,
 * fixing the "extraneous route" errors.
 */
export default function AppLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // We will build our own custom headers if needed
                animation: 'fade'   // Smooth transition
            }}
        />
    );
}