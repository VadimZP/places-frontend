import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import PlaceDetailsTab from "./PlaceDetailsTab";
import PlaceReviewsTab from "./PlaceReviewsTab";
import type { BottomTabParamList, PlaceScreenProps } from "../types";

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function PlaceScreen({
  route,
  navigation: placeScreenNavigation
}: PlaceScreenProps) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Details">
        {(props) => (
          <PlaceDetailsTab
            {...props}
            placeScreenNavigation={placeScreenNavigation}
            placeId={route.params.placeId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Reviews">
        {(props) => (
          <PlaceReviewsTab {...props} placeId={route.params.placeId} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
