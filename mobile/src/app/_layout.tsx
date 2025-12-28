import { Slot } from 'expo-router'; // שימי לב: Slot ולא Stack
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../../global.css";
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['SafeAreaView', 'Reanimated']);

// קוד ההשתקה הגרעיני שלך (אפשר להשאיר אותו)
const originalWarn = console.warn;
console.warn = (...args) => {
    const logString = args.join(' ');
    if (logString.includes('SafeAreaView') || logString.includes('Reanimated')) return;
    originalWarn(...args);
};

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <Slot />
        </SafeAreaProvider>
    );
}