import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import PlaceDetailsTab from "./PlaceDetailsTab";
import PlaceReviewsTab from "./PlaceReviewsTab";
import { type BottomTabParamList, type PlaceScreenProps } from "../types";

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function PlaceScreen({ route }: PlaceScreenProps) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="PlaceDetails">
        {(props) => (
          <PlaceDetailsTab {...props} placeId={route.params.placeId} />
        )}
      </Tab.Screen>
      <Tab.Screen name="PlaceReviews">
        {(props) => (
          <PlaceReviewsTab {...props} placeId={route.params.placeId} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
