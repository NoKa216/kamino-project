import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { User, Mail, Lock, AlertCircle } from 'lucide-react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { AuthFormData } from '../../schemas/authSchema';

interface Props {
    control: Control<AuthFormData>;
    errors: FieldErrors<AuthFormData>;
    onSignUp: () => void;
    isLoading: boolean;
    onLoginPress: () => void;
}

export const SignUpView = ({ control, errors, onSignUp, isLoading, onLoginPress }: Props) => {
    return (
        <View>
            <View className="mb-8 items-center">
                <Text className="text-white text-3xl font-black italic tracking-widest uppercase">Create Account</Text>
                <View className="h-[1px] w-8 bg-white/20 mt-3" />
            </View>

            <View className="gap-y-4">
                {/* Full Name Field */}
                <View>
                    <View className={`bg-white/10 border rounded-2xl h-16 flex-row items-center px-5 ${errors.fullName ? 'border-red-500/50' : 'border-white/20'}`}>
                        <User color={errors.fullName ? "#ef4444" : "rgba(255,255,255,0.4)"} size={18} />
                        <Controller
                            control={control}
                            name="fullName"
                            render={({ field: { onChange, value, onBlur } }) => (
                                <TextInput
                                    className="flex-1 ml-4 text-white font-medium"
                                    placeholder="Full Name"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={value || ''}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    </View>
                    {errors.fullName && (
                        <View className="flex-row items-center mt-1 ml-2">
                            <AlertCircle size={12} color="#ef4444" />
                            <Text className="text-red-500 text-xs ml-1 font-medium">{errors.fullName.message}</Text>
                        </View>
                    )}
                </View>

                {/* Email Field */}
                <View>
                    <View className={`bg-white/10 border rounded-2xl h-16 flex-row items-center px-5 ${errors.email ? 'border-red-500/50' : 'border-white/20'}`}>
                        <Mail color={errors.email ? "#ef4444" : "rgba(255,255,255,0.4)"} size={18} />
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
                                    keyboardType="email-address"
                                    autoCapitalize="none"
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

                {/* Password Field */}
                <View>
                    <View className={`bg-white/10 border rounded-2xl h-16 flex-row items-center px-5 ${errors.password ? 'border-red-500/50' : 'border-white/20'}`}>
                        <Lock color={errors.password ? "#ef4444" : "rgba(255,255,255,0.4)"} size={18} />
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value, onBlur } }) => (
                                <TextInput
                                    className="flex-1 ml-4 text-white font-medium"
                                    placeholder="Password"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    secureTextEntry
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                    </View>
                    {errors.password && (
                        <View className="flex-row items-center mt-1 ml-2">
                            <AlertCircle size={12} color="#ef4444" />
                            <Text className="text-red-500 text-xs ml-1 font-medium">{errors.password.message}</Text>
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity
                onPress={onSignUp}
                disabled={isLoading}
                className={`h-16 rounded-2xl items-center justify-center mt-8 ${isLoading ? 'bg-kamino-violet/50' : 'bg-kamino-violet'}`}
            >
                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg uppercase tracking-[2px]">Sign Up</Text>}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10">
                <Text className="text-white/30 text-[11px] font-medium uppercase tracking-wide">Already have an account?</Text>
                <TouchableOpacity onPress={onLoginPress}>
                    <Text className="text-white/70 text-[11px] font-bold ml-1 border-b border-white/30 uppercase">Sign In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};