import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Pressable } from 'react-native';
import { ChevronUp, Sparkles, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface CandidatePlace {
    id: string;
    name: string;
    matchTag?: string;    // התגית הקצרה (עד 5 מילים)
    matchReason: string;  // ההסבר המלא (נמצא במודל)
    suggestedCategory: string;
    description: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
    photos?: string[];
    rating?: number;
    userRatingCount?: number;
    openingHours?: {
        openNow: boolean;
        weekdayText: string[];
    } | null;
}

interface SwipeableCardProps {
    candidate: CandidatePlace;
    onDetailsPress?: () => void;
}

export function SwipeableCard({ candidate, onDetailsPress }: SwipeableCardProps) {
    const [photoIndex, setPhotoIndex] = useState(0);

    // --- תיקון: איפוס תמונה כשהכרטיס משתנה ---
    useEffect(() => {
        setPhotoIndex(0);
    }, [candidate.id]);

    const photos = candidate.photos && candidate.photos.length > 0 ? candidate.photos : [];
    const hasPhotos = photos.length > 0;

    const imageSource = hasPhotos
        ? { uri: photos[photoIndex] }
        : { uri: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop' };

    const handleNextPhoto = () => {
        if (!hasPhotos) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
    };

    const handlePrevPhoto = () => {
        if (!hasPhotos) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.max(0, prev - 1));
    };

    return (
        <View className="flex-1 w-full h-full rounded-[36px] overflow-hidden bg-[#121212] border border-white/10 shadow-2xl shadow-black relative">
            <ImageBackground source={imageSource} className="flex-1 w-full h-full" resizeMode="cover">

                {/* אזורי לחיצה */}
                <View className="absolute inset-0 flex-row z-10">
                    <Pressable className="w-[30%] h-full" onPress={handlePrevPhoto} />
                    <Pressable className="flex-1 h-full" onPress={onDetailsPress} />
                    <Pressable className="w-[30%] h-full" onPress={handleNextPhoto} />
                </View>

                {/* אינדיקטורים */}
                {hasPhotos && photos.length > 1 && (
                    <View className="absolute top-4 left-5 right-5 flex-row gap-1.5 z-20">
                        {photos.map((_, idx) => (
                            <View key={idx} className={`h-1 flex-1 rounded-full ${idx === photoIndex ? 'bg-white' : 'bg-white/30'}`} />
                        ))}
                    </View>
                )}

                {/* --- באדג' עליון משופר: שימוש ב-Tag הקצר --- */}
                <View className="absolute top-10 left-5 flex-row items-center bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-sm shadow-black/40 z-20">
                    <Sparkles size={12} color="#A78BFA" fill="#A78BFA" />
                    <Text className="text-white font-bold text-xs ml-1.5 tracking-wide shadow-black" numberOfLines={1}>
                        {candidate.matchTag || `Perfect for ${candidate.suggestedCategory}`}
                    </Text>
                </View>

                {/* פאנל תחתון */}
                <View className="absolute bottom-0 w-full z-20 overflow-hidden rounded-t-[32px] border-t border-white/10">
                    <View className="w-full bg-black/80 backdrop-blur-xl">
                        <TouchableOpacity activeOpacity={0.9} onPress={onDetailsPress} className="px-6 pt-6 pb-8">
                            <Text className="text-kamino-violet text-[10px] font-bold uppercase tracking-[2px] mb-2">
                                {candidate.suggestedCategory}
                            </Text>

                            <Text className="text-white text-3xl font-black mb-1 leading-tight" numberOfLines={2}>
                                {candidate.name}
                            </Text>

                            <View className="flex-row items-center mb-3 opacity-80">
                                <MapPin size={14} color="rgba(255,255,255,0.8)" />
                                {/* שימוש בכתובת המדויקת */}
                                <Text className="text-white/80 text-sm ml-1 font-medium flex-1" numberOfLines={1}>
                                    {candidate.location || "Explore this destination"}
                                    {candidate.rating ? ` • ⭐ ${candidate.rating} (${candidate.userRatingCount || 0})` : ''}
                                </Text>
                            </View>

                            <Text className="text-white/70 text-base font-normal leading-6 mb-4" numberOfLines={2}>
                                {candidate.description}
                            </Text>

                            <View className="w-full flex-row items-center justify-center opacity-40 mt-1">
                                <Text className="text-white text-[10px] font-bold uppercase tracking-widest mr-1">Read More</Text>
                                <ChevronUp size={12} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}