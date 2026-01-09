import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, Pressable, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { X, MapPin, Sparkles, Star, Clock, Maximize2, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CandidatePlace } from './discovery/SwipeableCard';

interface PlaceDetailsModalProps {
    isVisible: boolean;
    onClose: () => void;
    place: CandidatePlace | null;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const getTagsForCategory = (category: string) => {
    const common = ['Must See', 'Popular'];
    if (category === 'streetfood') return [...common, 'Foodie Heaven', 'Local Vibe', 'Cheap Eats'];
    if (category === 'museums') return [...common, 'Art', 'History', 'Quiet'];
    return [...common, 'Tourist Favorite', 'Instagrammable'];
};

// --- פונקציה לייצור מפה כהה ומקצועית ---
const getStaticMapUrl = (lat?: number, lng?: number) => {
    if (!lat || !lng) return 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000';

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
    const center = `${lat},${lng}`;

    // עיצוב Dark Mode / Technical Sketch
    const style = `&style=element:geometry%7Ccolor:0x242f3e&style=element:labels.text.stroke%7Ccolor:0x242f3e&style=element:labels.text.fill%7Ccolor:0x746855&style=feature:administrative.locality%7Celement:labels.text.fill%7Ccolor:0xd59563&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0xd59563&style=feature:poi.park%7Celement:geometry%7Ccolor:0x263c3f&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x6b9a76&style=feature:road%7Celement:geometry%7Ccolor:0x38414e&style=feature:road%7Celement:geometry.stroke%7Ccolor:0x212a37&style=feature:road%7Celement:labels.text.fill%7Ccolor:0x9ca5b3&style=feature:road.highway%7Celement:geometry%7Ccolor:0x746855&style=feature:road.highway%7Celement:geometry.stroke%7Ccolor:0x1f2835&style=feature:road.highway%7Celement:labels.text.fill%7Ccolor:0xf3d19c&style=feature:transit%7Celement:geometry%7Ccolor:0x2f3948&style=feature:transit.station%7Celement:labels.text.fill%7Ccolor:0xd59563&style=feature:water%7Celement:geometry%7Ccolor:0x17263c&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x515c6d&style=feature:water%7Celement:labels.text.stroke%7Ccolor:0x17263c`;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=15&size=600x300&maptype=roadmap&markers=color:0x7c3aed%7C${center}${style}&key=${apiKey}`;
};

export default function PlaceDetailsModal({ isVisible, onClose, place }: PlaceDetailsModalProps) {
    const [photoIndex, setPhotoIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setPhotoIndex(0);
            setIsFullScreen(false);
        }
    }, [isVisible, place?.id]);

    if (!place) return null;

    const photos = place.photos && place.photos.length > 0 ? place.photos : [];
    const currentPhoto = photos.length > 0
        ? photos[photoIndex]
        : 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000';

    const displayRating = place.rating || 4.8;
    const displayCount = place.userRatingCount || '2.4k';
    const tags = getTagsForCategory(place.suggestedCategory);

    // מפה דינמית
    const mapUrl = getStaticMapUrl(place.coordinates?.lat, place.coordinates?.lng);

    const handleNextPhoto = () => {
        if (photos.length <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
    };

    const handlePrevPhoto = () => {
        if (photos.length <= 1) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPhotoIndex(prev => Math.max(0, prev - 1));
    };

    // --- לוגיקת שעות הפתיחה המשופרת ---
    const renderOpeningHours = () => {
        if (!place.openingHours) return null;

        const { openNow, weekdayText } = place.openingHours;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];

        // מציאת השעות להיום
        const todayHours = weekdayText?.find(dayString => dayString.includes(todayName)) || "Check website";
        const cleanHours = todayHours.split(': ').slice(1).join(': ') || todayHours;

        return (
            <View className="flex-row items-start">
                <View className="w-8 items-center pt-1"><Clock size={18} color="#A3A3A3" /></View>
                <View className="flex-1">
                    <Text className="text-white/50 text-[10px] font-bold uppercase mb-0.5 tracking-wider">Opening Hours</Text>

                    {/* שעות ספציפיות */}
                    <Text className="text-white text-base font-medium mb-1">{cleanHours}</Text>

                    {/* סטטוס פתוח/סגור */}
                    <View className="flex-row items-center">
                        <View className={`w-2 h-2 rounded-full mr-2 ${openNow ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className={`text-xs font-bold ${openNow ? 'text-green-400' : 'text-red-400'}`}>
                            {openNow ? 'Open Now' : 'Closed'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View className="flex-1">
                <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0 bg-black/80" />

                <View className="absolute bottom-0 w-full bg-[#121212] rounded-t-[32px] overflow-hidden" style={{ height: SCREEN_HEIGHT * 0.92 }}>

                    {/* תמונה ראשית */}
                    <View className="w-full h-80 relative bg-neutral-900">
                        <Image source={{ uri: currentPhoto }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                        <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#121212] to-transparent" />

                        <View className="absolute inset-0 flex-row z-10">
                            <Pressable className="w-[30%] h-full" onPress={handlePrevPhoto} />
                            <Pressable className="flex-1 h-full items-center justify-center" onPress={() => setIsFullScreen(true)}>
                                <View className="bg-black/30 p-2 rounded-full opacity-0 active:opacity-100 transition-opacity">
                                    <Maximize2 color="white" size={24} />
                                </View>
                            </Pressable>
                            <Pressable className="w-[30%] h-full" onPress={handleNextPhoto} />
                        </View>

                        {photos.length > 1 && (
                            <View className="absolute top-4 left-4 right-16 flex-row gap-1.5 z-20">
                                {photos.map((_, idx) => (
                                    <View key={idx} className={`h-1 flex-1 rounded-full shadow-sm ${idx === photoIndex ? 'bg-white' : 'bg-white/30'}`} />
                                ))}
                            </View>
                        )}
                        <TouchableOpacity onPress={onClose} activeOpacity={0.8} className="absolute top-4 right-4 m-2 w-10 h-10 bg-black/60 rounded-full items-center justify-center border border-white/10 backdrop-blur-md z-50 shadow-lg">
                            <X color="white" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* תוכן המודל */}
                    <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-kamino-violet text-xs font-bold uppercase tracking-[2px]">{place.suggestedCategory}</Text>
                            <View className="flex-row items-center bg-white/10 px-2.5 py-1 rounded-full border border-white/5">
                                <Text className="text-white/60 text-[10px] font-bold mr-1.5">Google</Text>
                                <Star size={10} color="#FBBF24" fill="#FBBF24" />
                                <Text className="text-white text-xs font-bold ml-1">
                                    {displayRating}
                                    <Text className="text-white/50 font-medium text-[10px]"> ({displayCount})</Text>
                                </Text>
                            </View>
                        </View>

                        <Text className="text-white text-4xl font-black mb-4 leading-tight">{place.name}</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
                            {tags.map((tag, index) => (
                                <View key={index} className="bg-white/5 border border-white/10 px-4 py-2 rounded-full mr-2">
                                    <Text className="text-white/80 text-xs font-medium">{tag}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        {/* שימוש ב-matchReason המלא */}
                        <View className="w-full bg-kamino-violet/10 border border-kamino-violet/30 rounded-2xl p-5 mb-8 flex-row items-start shadow-sm shadow-kamino-violet/10">
                            <Sparkles size={20} color="#A78BFA" style={{ marginTop: 2 }} />
                            <View className="ml-3 flex-1">
                                <Text className="text-kamino-violet font-bold text-sm mb-1.5 uppercase tracking-wide">Why this fits you</Text>
                                <Text className="text-white/90 text-base leading-6 font-medium">{place.matchReason}</Text>
                            </View>
                        </View>

                        <View className="mb-8 gap-y-5">
                            <View className="flex-row items-start">
                                <View className="w-8 items-center pt-1"><MapPin size={18} color="#A3A3A3" /></View>
                                <View className="flex-1">
                                    <Text className="text-white/50 text-[10px] font-bold uppercase mb-0.5 tracking-wider">Address</Text>
                                    <Text className="text-white text-base font-medium leading-5">{place.location || "Loading address..."}</Text>
                                </View>
                            </View>

                            {/* שעות פתיחה */}
                            {renderOpeningHours()}
                        </View>

                        <Text className="text-white font-bold text-xl mb-3">About this place</Text>
                        <Text className="text-white/70 text-lg leading-8 font-normal mb-8">{place.description}</Text>

                        {/* מפה טכנית כהה */}
                        <Text className="text-white font-bold text-xl mb-4">Location</Text>
                        <View className="w-full h-48 rounded-3xl overflow-hidden border border-white/10 relative mb-8 bg-[#242f3e]">
                            <Image
                                source={{ uri: mapUrl }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                            <View className="absolute inset-0 bg-black/10" />
                            <View className="absolute bottom-3 right-3">
                                <TouchableOpacity className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex-row items-center">
                                    <Text className="text-white text-xs font-bold mr-1">Google Maps</Text>
                                    <Navigation size={10} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* תמונה במסך מלא */}
                {isFullScreen && (
                    <View className="absolute inset-0 bg-black z-50 justify-center items-center">
                        <StatusBar hidden={true} />
                        <Image source={{ uri: currentPhoto }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
                        <TouchableOpacity onPress={() => setIsFullScreen(false)} className="absolute top-12 right-6 z-50 bg-black/40 p-2 rounded-full">
                            <X color="white" size={28} />
                        </TouchableOpacity>

                        {photos.length > 1 && (
                            <View className="absolute top-14 left-6 right-20 flex-row gap-1.5 z-40">
                                {photos.map((_, idx) => (
                                    <View key={idx} className={`h-1 flex-1 rounded-full ${idx === photoIndex ? 'bg-white' : 'bg-white/30'}`} />
                                ))}
                            </View>
                        )}
                        <View className="absolute inset-0 flex-row z-10">
                            <Pressable className="w-[30%] h-full" onPress={handlePrevPhoto} />
                            <Pressable className="flex-1 h-full" onPress={() => setIsFullScreen(false)} />
                            <Pressable className="w-[30%] h-full" onPress={handleNextPhoto} />
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}