import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { X } from 'lucide-react-native';

// --- הגדרת תמונת הרקע ---
// הערה חשובה: החליפי את הכתובת הזו בתמונה המקומית שלך מתיקיית ה-assets
// לדוגמה: const bgImage = require('../../assets/images/your-stunning-view.jpg');
const bgImage = { uri: 'https://picsum.photos/seed/kaminoAdventure/828/1792' };

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
}

// שיניתי מעט את הגדרת הקומפוננטה כדי שתקבל את ה-props בצורה סטנדרטית
export default function AuthModal({ visible, onClose }: AuthModalProps) {
    // אם המודל לא אמור להיות גלוי, לא נחזיר כלום
    if (!visible) return null;

    return (
        // שימוש ב-ImageBackground כדי למלא את כל המסך בתמונה
        <ImageBackground
            source={bgImage}
            className="flex-1 justify-end" // justify-end דוחף את כל התוכן לתחתית המסך
            resizeMode="cover"
        >
            {/* משנה את צבע הסטטוס בר (שעון, סוללה) ללבן כדי שיראו אותו על רקע כהה */}
            <StatusBar barStyle="light-content" />

            {/* כפתור סגירה (X) בפינה העליונה */}
            {/* הוספתי רקע חצי שקוף קטן כדי שיהיה קריא על כל תמונה */}
            <TouchableOpacity
                onPress={onClose}
                className="absolute top-14 left-6 p-2 bg-black/30 rounded-full z-10"
            >
                <X size={20} color="white" />
            </TouchableOpacity>

            {/* מיכל התוכן התחתון */}
            {/* הוספתי גרדיאנט שחור עדין מאוד (bg-black/40) כדי שהטקסט הלבן יהיה קריא גם אם התמונה בהירה למטה */}
            <View className="px-6 pb-16 pt-10 bg-black/40 rounded-t-3xl space-y-8">

                {/* כותרות */}
                <View>
                    <Text className="text-4xl font-extrabold text-center text-white shadow-sm">
                        Plan Your Next Adventure
                    </Text>
                    <Text className="text-gray-200 text-center text-lg mt-3 px-4 font-medium">
                        Log in to save trips, invite friends, and plan together.
                    </Text>
                </View>

                {/* כפתורי סושיאל - שקופים */}
                <View className="space-y-4 w-full gap-3">

                    {/* כפתור גוגל - שקוף עם מסגרת לבנה */}
                    <TouchableOpacity className="w-full bg-transparent border border-white/60 py-4 rounded-full items-center flex-row justify-center space-x-3 backdrop-blur-md">
                        {/* כאן יבוא אייקון של גוגל */}
                        {/* <GoogleIcon size={24} color="white" /> */}
                        <Text className="text-white font-bold text-lg">Continue with Google</Text>
                    </TouchableOpacity>

                    {/* כפתור אפל (לדוגמה) - שקוף עם מסגרת לבנה */}
                    <TouchableOpacity className="w-full bg-transparent border border-white/60 py-4 rounded-full items-center flex-row justify-center space-x-3 backdrop-blur-md">
                        {/* כאן יבוא אייקון של אפל */}
                        {/* <AppleIcon size={24} color="white" /> */}
                        <Text className="text-white font-bold text-lg">Continue with Apple</Text>
                    </TouchableOpacity>
                </View>

                {/* קישור טקסט לאימייל */}
                <TouchableOpacity className="items-center mt-4" onPress={() => { /* ניווט לכניסה במייל */ }}>
                    <Text className="text-white font-semibold text-base underline-offset-4 underline opacity-90">
                        Continue with Email
                    </Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
}