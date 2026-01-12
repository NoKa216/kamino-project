/**
 * PlaceDetailsModal - Main Component (Orchestrator)
 * 
 * Responsibilities:
 * - Modal shell and layout
 * - Orchestrate sub-components
 * - Delegate logic to usePlaceDetails hook
 * 
 * Sub-components:
 * - PlaceImageGallery
 * - PlaceMetaInfo
 * - OpeningHoursRow
 * - LocationMapPreview
 */

import React, { memo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, Pressable, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { X, MapPin } from 'lucide-react-native';
import { PlaceCandidate } from '../types/place.types';
import { usePlaceDetails } from '../hooks/usePlaceDetails';
import { PlaceImageGallery } from './PlaceDetails/PlaceImageGallery';
import { PlaceMetaInfo } from './PlaceDetails/PlaceMetaInfo';
import { OpeningHoursRow } from './PlaceDetails/OpeningHoursRow';
import { LocationMapPreview } from './PlaceDetails/LocationMapPreview';
import { FullScreenPhotoViewer } from './PlaceDetails/FullScreenPhotoViewer';

interface PlaceDetailsModalProps {
    isVisible: boolean;
    onClose: () => void;
    place: PlaceCandidate | null;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function PlaceDetailsModal({ isVisible, onClose, place }: PlaceDetailsModalProps) {
    const {
        photoIndex,
        isFullScreen,
        photos,
        currentPhoto,
        displayRating,
        displayCount,
        todayHours,
        handleNextPhoto,
        handlePrevPhoto,
        handleToggleFullScreen,
    } = usePlaceDetails(place, isVisible);

    if (!place) return null;

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View className="flex-1">
                <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0 bg-black/80" />

                <View className="absolute bottom-0 w-full bg-[#121212] rounded-t-[32px] overflow-hidden" style={{ height: SCREEN_HEIGHT * 0.92 }}>

                    <PlaceImageGallery
                        currentPhoto={currentPhoto}
                        photos={photos}
                        photoIndex={photoIndex}
                        onPrevPhoto={handlePrevPhoto}
                        onNextPhoto={handleNextPhoto}
                        onToggleFullScreen={handleToggleFullScreen}
                        onClose={onClose}
                    />

                    <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

                        <PlaceMetaInfo
                            place={place}
                            displayRating={displayRating}
                            displayCount={displayCount}
                        />

                        <View className="mb-8 gap-y-5">
                            {/* Address */}
                            <View className="flex-row items-start">
                                <View className="w-8 items-center pt-1">
                                    <MapPin size={18} color="#A3A3A3" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white/50 text-[10px] font-bold uppercase mb-0.5 tracking-wider">
                                        Address
                                    </Text>
                                    <Text className="text-white text-base font-medium leading-5">
                                        {place.location || 'Loading address...'}
                                    </Text>
                                </View>
                            </View>

                            {/* Opening hours */}
                            {place.openingHours && todayHours && (
                                <OpeningHoursRow
                                    openNow={place.openingHours.openNow}
                                    todayHours={todayHours}
                                />
                            )}
                        </View>

                        <Text className="text-white font-bold text-xl mb-3">About this place</Text>
                        <Text className="text-white/70 text-lg leading-8 font-normal mb-8">
                            {place.description}
                        </Text>

                        <LocationMapPreview mapUrl={place.staticMapUrl} />
                    </ScrollView>
                </View>

                <FullScreenPhotoViewer
                    visible={isFullScreen}
                    currentPhoto={currentPhoto}
                    photos={photos}
                    photoIndex={photoIndex}
                    onClose={handleToggleFullScreen}
                    onPrevPhoto={handlePrevPhoto}
                    onNextPhoto={handleNextPhoto}
                />
            </View>
        </Modal>
    );
}

export default memo(PlaceDetailsModal);