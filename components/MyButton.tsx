import {
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface MyButtonProps<T> {
  onPress: () => T;
  title: string;
  height?: string | number;
  width?: string | number;
  isDisabled?: boolean;
  isLoading?: boolean;
  pressableStyles?: StyleProp<ViewStyle>;
  textStyles?: StyleProp<TextStyle>;
}

export default function MyButton<T>({
  onPress,
  title,
  width = 120,
  height = 40,
  isDisabled = false,
  isLoading = false,
  pressableStyles = {},
  textStyles = {}
}: MyButtonProps<T>) {
  return (
    <Pressable
      disabled={isDisabled}
      style={[
        styles.button,
        { width, height },
        pressableStyles,
        isDisabled ? { backgroundColor: "#9C9C9C" } : {}
      ]}
      onPress={() => {
        onPress();
      }}
    >
      <LinearGradient
        locations={[0.1, 0.8]}
        colors={isDisabled ? ["#9C9C9C", "#9C9C9C"] : ["#975FA5", "#9C6CA8"]}
        style={styles.gradient}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Text style={[styles.textStyle, textStyles]}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    shadowColor: "#9C9C9C",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
    backgroundColor: "#975FA5",
    borderRadius: 100
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
    fontFamily: "RobotoMono_700Bold",
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
