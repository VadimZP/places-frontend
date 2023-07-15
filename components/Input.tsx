import {
  type StyleProp,
  type ViewStyle,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { color } from "react-native-elements/dist/helpers";

interface InputProps<T> {
  label: string;
  value: string;
  onChangeText: (text: string) => T;
  wrapperStyles?: StyleProp<ViewStyle>;
  textarea?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function Input<T>({
  label,
  value,
  onChangeText,
  wrapperStyles,
  textarea,
  multiline,
  numberOfLines
}: InputProps<T>) {
  const inputStyles =
    textarea != null && textarea ? styles.textarea : styles.input;

  return (
    <View style={wrapperStyles}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        {...(multiline != null && multiline ? { multiline } : {})}
        {...(numberOfLines != null ? { numberOfLines } : {})}
        style={inputStyles}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    marginLeft: 8,
    marginBottom: 8,
    color: "#4B4B4B",
    fontWeight: "500"
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 9,
    borderColor: "#975FA5",
    padding: 16,
    color: "#4B4B4B"
  },
  textarea: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 9,
    borderColor: "#975FA5",
    paddingTop: 16,
    paddingHorizontal: 16,
    textAlignVertical: "top",
    height: 100,
    color: "#4B4B4B"
  }
});
