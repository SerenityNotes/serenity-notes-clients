import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Linking,
  Text as ReactNativeText,
} from "react-native";
import Button from "../ui/Button";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },

  content: {
    alignItems: "center",
  },
  list: {
    alignItems: "flex-start",
  },
  logo: {
    width: 255,
    height: 45,
  },
  termsText: {
    textAlign: "center",
  },
});

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          style={styles.logo}
          source={{
            uri:
              "data:image/png;base64,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",
          }}
        />
      </View>
      <Spacer />
      <Spacer />
      <Spacer />
      <Spacer />
      <Spacer />
      <Button
        mode="contained"
        onPress={() => {
          navigation.navigate("Onboarding");
        }}
      >
        Setup new Device & new User
      </Button>
      <Spacer />
      <Button
        mode="outlined"
        onPress={() => {
          navigation.navigate("AddDeviceToExistingUserScreen");
        }}
      >
        Add new Device to existing User
      </Button>
      <Spacer />
      <Spacer />
      <Spacer />
      <View style={styles.content}>
        <Text weight="bold">Features</Text>
        <Spacer size="s" />
        <View style={styles.list}>
          <Text>- Collaborative editing</Text>
          <Text>- End to end encrypted</Text>
          <Text>- Offline first</Text>
        </View>
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />
        <ReactNativeText style={{ textAlign: "center" }}>
          <Text size="s">
            By signing in you accept our{" "}
            <ReactNativeText
              style={{ textDecorationLine: "underline" }}
              onPress={() => {
                Linking.openURL(
                  "https://www.serenity.re/en/notes/terms-and-conditions"
                );
              }}
            >
              Terms & Conditions
            </ReactNativeText>{" "}
            and{" "}
            <ReactNativeText
              style={{ textDecorationLine: "underline" }}
              onPress={() => {
                Linking.openURL(
                  "https://www.serenity.re/en/notes/privacy-policy"
                );
              }}
            >
              Privacy Policy
            </ReactNativeText>
            .
          </Text>
        </ReactNativeText>
      </View>
    </View>
  );
}
