import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Mail, Lock, AlertCircle } from 'lucide-react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { AuthFormData } from '../../schemas/authSchema';

interface Props {
    control: Control<AuthFormData>;
    errors: FieldErrors<AuthFormData>;
    onLogin: () => void;
    isLoading: boolean;
    onSignUpPress: () => void;
    onForgotPasswordPress: () => void;
}

export const EmailLoginView = ({
    control,
    errors,
    onLogin,
    isLoading,
    onSignUpPress,
    onForgotPasswordPress
}: Props) => {
    return (
        <View>
            <View className="mb-10 items-center">
                <Text className="text-white text-3xl font-black italic tracking-widest uppercase">
                    Sign In
                </Text>
                <View className="h-[1px] w-8 bg-white/20 mt-3" />
            </View>

            <View className="gap-y-4">
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

                <TouchableOpacity onPress={onForgotPasswordPress} className="self-end py-1">
                    <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={onLogin}
                disabled={isLoading}
                className={`h-16 rounded-2xl items-center justify-center mt-8 ${isLoading ? 'bg-kamino-violet/50' : 'bg-kamino-violet'}`}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-black text-lg uppercase tracking-[2px]">
                        Sign In
                    </Text>
                )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10">
                <Text className="text-white/30 text-[11px] font-medium uppercase tracking-wide">
                    New to Kamino?
                </Text>
                <TouchableOpacity onPress={onSignUpPress}>
                    <Text className="text-white/70 text-[11px] font-bold ml-1 border-b border-white/30 uppercase">
                        Create Account
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};