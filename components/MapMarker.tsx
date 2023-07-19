import { View, Text } from "react-native";
import { Marker, Callout, type CalloutPressEvent } from "react-native-maps";

interface MyMapMarkerProps {
  placeId: number;
  longitude: number;
  latitude: number;
  placeName: string;
  onPress: ((event: CalloutPressEvent) => void) | undefined;
}

export default function MyMapMarker({
  placeId,
  longitude,
  latitude,
  placeName,
  onPress
}: MyMapMarkerProps) {
  return (
    <Marker
      coordinate={{
        longitude: +longitude,
        latitude: +latitude
      }}
    >
      <Callout onPress={onPress}>
        <View>
          <Text>{placeName}</Text>
        </View>
      </Callout>
    </Marker>
  );
}
