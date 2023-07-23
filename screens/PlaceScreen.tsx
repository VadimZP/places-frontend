import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

import PlaceDetailsTab from "./PlaceDetailsTab";
import PlaceReviewsTab from "./PlaceReviewsTab";
import type { BottomTabParamList, PlaceScreenProps } from "../types";
import { StyleSheet } from "react-native";
import React from "react";

const Tab = createBottomTabNavigator<BottomTabParamList>();

const Icon = ({ name, size, color, component }) => {
  return React.createElement(component, {
    name,
    size,
    color
  });
};

export default function PlaceScreen({
  route,
  navigation: placeScreenNavigation
}: PlaceScreenProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#4D3453"
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let component;

          if (route.name === "Details") {
            iconName = "enviroment";
            component = AntDesign;
          } else if (route.name === "Reviews") {
            component = MaterialIcons;
            iconName = "rate-review";
          }

          // You can return any component that you like here!
          return (
            <Icon
              name={iconName}
              size={size}
              color={color}
              component={component}
            />
          );
        },

        tabBarActiveTintColor: "#fff"
      })}
    >
      <Tab.Screen
        name="Details"
        options={{
          tabBarLabelStyle: styles.tabBarLabelStyle
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
          tabBarLabelStyle: styles.tabBarLabelStyle
        }}
      >
        {(props) => (
          <PlaceReviewsTab {...props} placeId={route.params.placeId} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarLabelStyle: {
    fontSize: 12,
    fontFamily: "RobotoMono_700Bold"
  }
});
