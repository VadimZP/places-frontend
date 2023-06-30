import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SupabaseClient } from '@supabase/supabase-js'

export interface RootStackParamList {
  Auth: undefined
  Home: undefined
  PlaceDetails: { placeId: number }
}

export type AuthScreenProps = NativeStackScreenProps<
RootStackParamList,
'Auth'
>

export type HomeScreenProps = NativeStackScreenProps<
RootStackParamList,
'Home'
>

export type PlaceScreenProps = NativeStackScreenProps<
RootStackParamList,
'PlaceDetails'
>

export interface Place {
  id: number
  name: string
  content?: string
  location: string
  created_at: Date
}

export interface Review {
  id: number
  content: string
  rating: number
  place_id: number
  author_id: string
  created_at: Date
  profiles: {
    email: string
  }
}
