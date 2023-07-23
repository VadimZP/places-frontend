import { Text, SafeAreaView, StyleSheet, View } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Entypo } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { type Session } from "@supabase/supabase-js";

import { supabase } from "./supabase";
import { type RootStackParamList } from "./types";
import AuthScreen from "./screens/AuthScreen";
import PlaceScreen from "./screens/PlaceScreen";
import HomeScreen from "./screens/HomeScreen";

import {
  useFonts,
  RobotoMono_100Thin,
  RobotoMono_200ExtraLight,
  RobotoMono_300Light,
  RobotoMono_400Regular,
  RobotoMono_500Medium,
  RobotoMono_600SemiBold,
  RobotoMono_700Bold,
  RobotoMono_100Thin_Italic,
  RobotoMono_200ExtraLight_Italic,
  RobotoMono_300Light_Italic,
  RobotoMono_400Regular_Italic,
  RobotoMono_500Medium_Italic,
  RobotoMono_600SemiBold_Italic,
  RobotoMono_700Bold_Italic
} from "@expo-google-fonts/roboto-mono";

const queryClient = new QueryClient();

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    RobotoMono_100Thin,
    RobotoMono_200ExtraLight,
    RobotoMono_300Light,
    RobotoMono_400Regular,
    RobotoMono_500Medium,
    RobotoMono_600SemiBold,
    RobotoMono_700Bold,
    RobotoMono_100Thin_Italic,
    RobotoMono_200ExtraLight_Italic,
    RobotoMono_300Light_Italic,
    RobotoMono_400Regular_Italic,
    RobotoMono_500Medium_Italic,
    RobotoMono_600SemiBold_Italic,
    RobotoMono_700Bold_Italic
  });

  const [session, setSession] = useState<Session | null>(null);
  const [isCredentialsChecked, setIsCredentialsChecked] =
    useState<boolean>(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .finally(() => {
        setIsCredentialsChecked(true);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // if (!fontsLoaded) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <Text>Loading fonts...</Text>
  //     </SafeAreaView>
  //   );
  // }

  // if (isCheckingCredentials) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <Text>Loading the app...</Text>
  //     </SafeAreaView>
  //   );
  // }

  const onLayoutRootView = useCallback(async () => {
    if (session === null && fontsLoaded && isCredentialsChecked) {
      await SplashScreen.hideAsync();
    }
  }, [session, fontsLoaded, isCredentialsChecked]);

  if (!fontsLoaded || !isCredentialsChecked) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <NavigationContainer>
          <Stack.Navigator>
            {session == null ? (
              <Stack.Screen name="Auth" component={AuthScreen} />
            ) : (
              <>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ headerShown: false }}
                  initialParams={{
                    fontsLoaded,
                    isCredentialsChecked
                  }}
                />
                <Stack.Screen
                  name="Place"
                  component={PlaceScreen}
                  options={{
                    headerShown: false,
                    headerStyle: {
                      backgroundColor: "#4D3453"
                    },
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                      fontFamily: "RobotoMono_700Bold",
                      fontWeight: "bold"
                    }
                  }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
