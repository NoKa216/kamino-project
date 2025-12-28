import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Mail, Lock, User } from 'lucide-react-native';

interface Props {
    onLoginPress: () => void;
    onSignUp: () => void;
}

export const SignUpView = ({ onLoginPress, onSignUp }: Props) => (
    <>
        <View className="items-center mb-8">
            <Text className="text-white text-3xl font-black italic tracking-widest uppercase text-center">
                Create Account
            </Text>
            <View className="h-[1px] w-8 bg-white/20 mt-2" />
        </View>

        <View className="gap-y-4">
            <View className="bg-white/10 border border-white/20 rounded-2xl h-16 flex-row items-center px-5">
                <User color="rgba(255,255,255,0.4)" size={18} />
                <TextInput className="flex-1 ml-4 text-white font-medium" placeholder="Full Name" placeholderTextColor="rgba(255,255,255,0.2)" />
            </View>

            <View className="bg-white/10 border border-white/20 rounded-2xl h-16 flex-row items-center px-5">
                <Mail color="rgba(255,255,255,0.4)" size={18} />
                <TextInput className="flex-1 ml-4 text-white font-medium" placeholder="Email Address" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View className="bg-white/10 border border-white/20 rounded-2xl h-16 flex-row items-center px-5">
                <Lock color="rgba(255,255,255,0.4)" size={18} />
                <TextInput className="flex-1 ml-4 text-white font-medium" placeholder="Password" placeholderTextColor="rgba(255,255,255,0.2)" secureTextEntry />
            </View>

            <TouchableOpacity onPress={onSignUp} className="bg-kamino-violet h-16 rounded-2xl items-center justify-center mt-6">
                <Text className="text-white font-black text-lg uppercase tracking-[2px]">Get Started</Text>
            </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-10">
            <Text className="text-white/30 text-[11px] font-medium tracking-wide">ALREADY HAVE AN ACCOUNT? </Text>
            <TouchableOpacity onPress={onLoginPress}>
                <Text className="text-white/70 text-[11px] font-bold ml-1 border-b border-white/30">LOG IN</Text>
            </TouchableOpacity>
        </View>
    </>
);