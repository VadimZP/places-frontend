import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input } from "react-native-elements";

import { supabase } from "../supabase";
import { Styles } from "../constants";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error != null) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error != null) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View>
      <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => {
            setEmail(text);
          }}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => {
            setPassword(text);
          }}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View>
      <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => {
            void signInWithEmail();
          }}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => {
            void signUpWithEmail();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: Styles.spacing
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch"
  }
});
