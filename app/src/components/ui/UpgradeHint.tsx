import React from "react";
import { Text, StyleSheet, View, Linking } from "react-native";
import { useClient } from "urql";
import { sizes } from "../../styles/fonts";
import colors from "../../styles/colors";
import { homeLink } from "../../utils/links";
import latestMacClientVersionQuery from "../../graphql/latestMacClientVersion";
import { Platform } from "react-native";
import appVersion from "../../utils/appVersion/appVersion";
import isGreaterAppVersion from "../../utils/isGreaterAppVersion/isGreaterAppVersion";
import useInterval from "../../hooks/useInterval";
import { addDebugLogEntry } from "../../stores/debugStore";

const styles = StyleSheet.create({
  hint: {
    color: "#4e614e",
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    backgroundColor: "#eefdee",
    padding: sizes.medium * 0.8,
  },
  hintWrapper: {
    borderColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

const UpgradeHint: React.FC = () => {
  const [latestMacClientVersion, setLatestMacClientVersion] = React.useState<
    string | undefined
  >();
  const client = useClient();
  useInterval(async () => {
    try {
      const result = await client
        .query(latestMacClientVersionQuery)
        .toPromise();
      if (result?.data?.latestMacClientVersion) {
        setLatestMacClientVersion(result?.data?.latestMacClientVersion);
      }
    } catch (err) {
      // silently fail
      addDebugLogEntry(`macOS update check failed: ${err}`, "error");
    }
  }, 600000); // check every 10 min

  if (Platform.OS !== "macos") return null;

  if (
    appVersion &&
    latestMacClientVersion &&
    isGreaterAppVersion(latestMacClientVersion, appVersion)
  ) {
    return (
      <View style={styles.hintWrapper}>
        <Text style={styles.hint}>
          A new version of the desktop app is available for download. Get it
          from{" "}
          <Text
            style={{ textDecorationLine: "underline", color: "#4e614e" }}
            onPress={() => {
              Linking.openURL(homeLink);
            }}
          >
            {homeLink}
          </Text>
        </Text>
      </View>
    );
  }
  return null;
};

export default UpgradeHint;
