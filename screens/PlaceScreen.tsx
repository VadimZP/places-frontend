import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

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
      <Tab.Screen
        name="Details"
        options={{
          tabBarIcon: () => (
            <AntDesign name="enviroment" size={24} color="black" />
          )
        }}
      >
        {(props) => (
          <PlaceDetailsTab
            {...props}
            placeScreenNavigation={placeScreenNavigation}
            placeId={route.params.placeId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Reviews"
        options={{
          tabBarIcon: () => (
            <MaterialIcons name="rate-review" size={24} color="black" />
          )
        }}
      >
        {(props) => (
          <PlaceReviewsTab {...props} placeId={route.params.placeId} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
