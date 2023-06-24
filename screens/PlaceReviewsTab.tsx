import { Pressable, SafeAreaView, StyleSheet, Text } from "react-native";

export default function PlaceReviewsTab() {
  function createReview() {}
  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.button} onPress={createReview}>
        <Text style={styles.textStyle}>Write a review</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff8e7",
    flex: 1,
  },
  button: {
    borderRadius: 6,
    padding: 10,
    shadowColor: "#412e00",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,

    elevation: 3,
    borderColor: "#808080",
    borderWidth: 1,
    backgroundColor: "#e6edff",

    marginBottom: 20,
  },
  textStyle: {
    fontSize: 14,
    color: "#412e00",
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
});
