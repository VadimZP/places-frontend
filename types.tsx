import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SupabaseClient } from "@supabase/supabase-js";

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  PlaceDetails: { placeId: number };
};

export type AuthScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Auth"
>;

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

export type PlaceScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlaceDetails"
>;

export interface Place {
  id: number;
  name: string;
  content?: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
}
