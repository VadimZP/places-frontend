import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface MyButtonProps<T> {
  onPress: () => T;
  title: string;
  width?: string | number;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function MyButton<T>({
  onPress,
  title,
  width = 120,
  disabled,
  isLoading = false
}: MyButtonProps<T>) {
  return (
    <Pressable
      {...(disabled != null ? { disabled } : {})}
      style={[styles.button, { width }]}
      onPress={() => {
        onPress();
      }}
    >
      <LinearGradient
        locations={[0.1, 0.8]}
        colors={
          disabled != null && disabled
            ? ["#9C9C9C", "#9C9C9C"]
            : ["#975FA5", "#9C6CA8"]
        }
        style={styles.gradient}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Text style={styles.textStyle}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 40,
    shadowColor: "#9C9C9C",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
    backgroundColor: "#975FA5",
    borderRadius: 9
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
