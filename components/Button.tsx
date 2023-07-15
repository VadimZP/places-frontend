import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps<T> {
  onPress: () => T;
  title: string;
}

export default function Button<T>({ onPress, title }: ButtonProps<T>) {
  return (
    <Pressable
      style={styles.button}
      onPress={() => {
        onPress();
      }}
    >
      <LinearGradient
        locations={[0.1, 0.8]}
        colors={["#975FA5", "#9C6CA8"]}
        style={styles.gradient}
      >
        <Text style={styles.textStyle}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 120,
    height: 40,
    shadowColor: "#9C9C9C",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2
  },
  gradient: {
    flex: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  textStyle: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.4,
    shadowRadius: 1
  }
});
