import React from "react";
import { StyleSheet, View } from "react-native";
import Notes from "./NotesScreen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Notes navigation={navigation} />
    </View>
  );
}
