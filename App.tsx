import { Text, SafeAreaView, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Entypo } from "@expo/vector-icons";
import { type Session } from "@supabase/supabase-js";

import { supabase } from "./supabase";
import { type RootStackParamList } from "./types";
import AuthScreen from "./screens/AuthScreen";
import PlaceScreen from "./screens/PlaceScreen";
import HomeScreen from "./screens/HomeScreen";

const queryClient = new QueryClient();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingCredentials, setIsCheckingCredentials] = useState(false);

  useEffect(() => {
    setIsCheckingCredentials(true);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .finally(() => {
        setIsCheckingCredentials(false);
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

  if (isCheckingCredentials) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading the app...</Text>
      </SafeAreaView>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator>
          {session == null ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="Place"
                component={PlaceScreen}
                options={{
                  headerRight: () => (
                    <Entypo.Button
                      name="dots-three-vertical"
                      size={24}
                      color="black"
                    />
                  )
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
