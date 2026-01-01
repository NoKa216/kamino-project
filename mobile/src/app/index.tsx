import { View, ActivityIndicator } from 'react-native';

export default function RootIndex() {
    return (
        <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#A78BFA" />
        </View>
    );
}