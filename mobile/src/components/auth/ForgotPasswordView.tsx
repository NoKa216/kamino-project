import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Mail, AlertCircle } from 'lucide-react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { AuthFormData } from '../../schemas/authSchema';

interface Props {
    control: Control<AuthFormData>;
    errors: FieldErrors<AuthFormData>;
    onResetPress: () => void;
    onBackToLogin: () => void;
}

export const ForgotPasswordView = ({ control, errors, onResetPress, onBackToLogin }: Props) => (
    <>
        <View className="items-center mb-8">
            <Text className="text-white text-3xl font-black italic tracking-widest uppercase text-center">
                Reset Password
            </Text>
            <View className="h-[1px] w-8 bg-white/20 mt-2" />
            <Text className="text-white/40 text-[11px] text-center mt-4 px-4 leading-4">
                Enter your email address and we'll send you a link to reset your password.
            </Text>
        </View>

        <View className="gap-y-6">
            {/* --- Email Input --- */}
            <View>
                <View className={`bg-white/10 border rounded-2xl h-16 flex-row items-center px-5 ${errors.email ? 'border-red-500/50' : 'border-white/20'}`}>
                    <Mail color={errors.email ? '#ef4444' : "rgba(255,255,255,0.4)"} size={18} />
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <TextInput
                                className="flex-1 ml-4 text-white font-medium"
                                placeholder="Email Address"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        )}
                    />
                </View>
                {errors.email && (
                    <View className="flex-row items-center mt-1 ml-2">
                        <AlertCircle size={12} color="#ef4444" />
                        <Text className="text-red-500 text-xs ml-1 font-medium">{errors.email.message}</Text>
                    </View>
                )}
            </View>

            {/* Action Button */}
            <TouchableOpacity
                onPress={onResetPress}
                className="bg-kamino-violet h-16 rounded-2xl items-center justify-center shadow-lg shadow-kamino-violet/20"
            >
                <Text className="text-white font-black text-lg uppercase tracking-[2px]">Send Link</Text>
            </TouchableOpacity>
        </View>

        {/* Navigation Back */}
        <View className="flex-row justify-center mt-10">
            <TouchableOpacity onPress={onBackToLogin}>
                <Text className="text-white/70 text-[11px] font-bold border-b border-white/30 uppercase tracking-widest">
                    Back to Login
                </Text>
            </TouchableOpacity>
        </View>
    </>
);