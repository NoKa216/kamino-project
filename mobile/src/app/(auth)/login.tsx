import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native'; // אייקון חזרה אם תרצי

// אל תשכחי להחליף לתמונה האמיתית שלך!
const bgImage = { uri: 'https://picsum.photos/seed/kaminoAdventure/828/1792' };

export default function LoginScreen() {
    const router = useRouter();

    return (
        <ImageBackground
            source={bgImage}
            className="flex-1 justify-end"
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" />

            {/* כפתור חזרה (אופציונלי - אם רוצים לחזור למצגת) */}
            {/* <TouchableOpacity 
        onPress={() => router.back()} 
        className="absolute top-14 left-6 p-2 bg-black/30 rounded-full z-10"
      >
        <ArrowLeft size={20} color="white" />
      </TouchableOpacity>
      */}

            {/* מיכל התוכן התחתון */}
            <View className="px-6 pb-16 pt-10 bg-black/40 rounded-t-3xl space-y-8 backdrop-blur-sm">

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

                    <TouchableOpacity className="w-full bg-black/20 border border-white/60 py-4 rounded-full items-center flex-row justify-center space-x-3">
                        {/* אייקון גוגל */}
                        <Text className="text-white font-bold text-lg">Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-full bg-black/20 border border-white/60 py-4 rounded-full items-center flex-row justify-center space-x-3">
                        {/* אייקון אפל */}
                        <Text className="text-white font-bold text-lg">Continue with Apple</Text>
                    </TouchableOpacity>
                </View>

                {/* קישור טקסט לאימייל */}
                <TouchableOpacity className="items-center mt-4">
                    <Text className="text-white font-semibold text-base underline-offset-4 underline opacity-90">
                        Continue with Email
                    </Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
}