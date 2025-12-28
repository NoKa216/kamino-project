import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import '../../global.css';

// 1. השתקת הפופ-אפים והלוגים בטרמינל
LogBox.ignoreLogs([
    '[Reanimated] Reading from `value` during component render',
    '[Reanimated] Writing to `value` during component render',
    'SafeAreaView has been deprecated',
]);

if (__DEV__) {
    // 2. השתקת הפס השחור בתחתית המסך באימולטור (Warning Notifications)
    LogBox.ignoreAllLogs();

    const ignoreWarns = [
        '[Reanimated] Reading from `value` during component render',
        '[Reanimated] Writing to `value` during component render',
        'SafeAreaView has been deprecated',
    ];

    const warn = console.warn;
    console.warn = (...args) => {
        if (ignoreWarns.some((log) => args[0]?.includes?.(log))) {
            return;
        }
        warn(...args);
    };
}

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}