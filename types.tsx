import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

// react-native-navigation documentation states "The type containing the mappings must be a type alias" https://reactnavigation.org/docs/typescript/#type-checking-the-navigator
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Place: { placeId: number };
};

export type AuthScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Auth"
>;

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

export type HomeScreenNavigationProp = HomeScreenProps["navigation"];

export type PlaceScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Place"
>;

// react-native-navigation documentation states "The type containing the mappings must be a type alias" https://reactnavigation.org/docs/typescript/#type-checking-the-navigator
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type BottomTabParamList = {
  Details: undefined;
  Reviews: undefined;
};

export type PlaceDetailsTabProps = BottomTabScreenProps<
  BottomTabParamList,
  "Details"
>;
export type PlaceReviewsTabProps = BottomTabScreenProps<
  BottomTabParamList,
  "Reviews"
>;

export interface Place {
  id: number;
  name: string;
  content?: string;
  location: string;
  created_at: string;
}

export interface Review {
  id: number;
  content: string;
  rating: number;
  place_id: number;
  author_id: string;
  created_at: string;
  profiles: {
    email: string;
  };
}
