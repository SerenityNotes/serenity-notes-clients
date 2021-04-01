import React, { useEffect, useRef, useCallback, useState } from "react";
import { Asset } from "expo-asset";
import { View, StyleSheet, Platform } from "react-native";
import { IconButton } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";
import deepEqual from "fast-deep-equal/es6";
import { Y } from "../../vendor/index.js";
import * as repositoryStore from "../../utils/repositoryStore";
import KeyboardAvoidContainer from "../ui/KeyboardAvoidContainer";
import Spacer from "../ui/Spacer";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import Text from "../ui/Text";
import LoadingView from "../ui/LoadingView";
import UploadArrow from "../ui/UploadArrow";
import DownloadArrow from "../ui/DownloadArrow";
import ServerSyncInfo from "../ui/ServerSyncInfo";
import { Repository } from "../../types";
import colors from "../../styles/colors";
import * as mutationQueue from "../../hooks/useSyncUtils/mutationQueue";

let source =
  Platform.OS === "ios" ? require("../../assets/index.html") : { html: null };

async function loadHtmlFileForAndroid() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const indexHtml = Asset.fromModule(require("../../assets/index.html"));
  await indexHtml.downloadAsync();
  const html = await FileSystem.readAsStringAsync(indexHtml.localUri);
  source = { html };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    // changing it to flex: 1 leads to weird behaviour e.g. notes don't render at the top and it somehow flickers
    height: "100%",
  },
  webView: {
    backgroundColor: "#fff",
    flex: 1,
    display: "flex",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
  },
  syncInfo: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 6, // same as react-native-paper's IconButton
  },
});

type HeaderRightProps = {
  navigation: any;
  repository: Repository;
};

const HeaderRight = ({ navigation, repository }: HeaderRightProps) => {
  const [
    uploadSyncState,
    setUploadSyncState,
  ] = useState<mutationQueue.RepositorySyncState>({
    state: "unknown",
  });

  useEffect(() => {
    setUploadSyncState(mutationQueue.getRepositorySyncState(repository.id));
    const subscriptionId = mutationQueue.subscribeToRepository(
      repository.id,
      (syncState) => {
        setUploadSyncState(syncState);
      }
    );
    return () => {
      mutationQueue.unsubscribeToRepository(subscriptionId);
    };
  }, []);

  let failedDownload = true;
  if (repository?.updates) {
    failedDownload = repository.updates.some(
      (update) => update.type === "failed"
    );
  }
  return (
    <View style={styles.headerRight}>
      <View style={styles.syncInfo}>
        <UploadArrow
          animationActive={
            uploadSyncState.state === "in-progress" ||
            uploadSyncState.state === "retry-in-progress"
          }
          color={
            uploadSyncState.state === "unknown"
              ? "#aaa"
              : uploadSyncState.state === "retry-in-progress"
              ? colors.error
              : colors.success
          }
        />
        <DownloadArrow
          // TODO show when a update decryption is in progress
          animationActive={false}
          color={failedDownload ? colors.error : colors.success}
          style={{
            marginLeft: 2,
          }}
        />
      </View>
      <IconButton
        icon="account-multiple"
        color={colors.primary}
        onPress={() => {
          navigation.navigate("NoteSettings", {
            id: repository.id,
          });
        }}
        style={{
          marginRight: -4,
        }}
      />
      <IconButton
        icon="dots-horizontal-circle-outline"
        color={colors.primary}
        onPress={() => {
          navigation.navigate("NoteSettings", {
            id: repository.id,
          });
        }}
      />
    </View>
  );
};

export default function NoteScreen({ route, navigation }) {
  const { id, isNew } = route.params;
  const yDocRef = useRef(null);
  const contentRef = useRef(null);
  const initializedRef = useRef(false);
  const webViewRef = useRef(null);
  const [, updateState] = React.useState();
  const [isDeleted, setIsDeleted] = React.useState(false);
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    const initDoc = async (id) => {
      if (Platform.OS !== "ios") {
        await loadHtmlFileForAndroid();
      }
      const newYDoc = new Y.Doc();
      yDocRef.current = newYDoc;
      const repo = await repositoryStore.getRepository(id);
      if (repo) {
        Y.applyUpdate(yDocRef.current, repo.content);
        contentRef.current = repo.content;
        forceUpdate();
        navigation.setOptions({
          headerRight: () => (
            <HeaderRight navigation={navigation} repository={repo} />
          ),
        });
      } else {
        forceUpdate();
      }
    };
    initDoc(id);

    const subscriptionId = repositoryStore.subscribeToRepository(
      id,
      (repository) => {
        // avoid update before the webview is even initialized
        if (!initializedRef.current) return;
        // happens in case the repository is removed
        if (!repository) {
          setIsDeleted(true);
          return;
        }
        Y.applyUpdate(yDocRef.current, repository.content);
        webViewRef.current.injectJavaScript(`
          window.applyYjsUpdate(${JSON.stringify(
            Array.apply([], repository.content)
          )});
          true;
        `);
        navigation.setOptions({
          headerRight: () => (
            <HeaderRight navigation={navigation} repository={repository} />
          ),
        });
      }
    );

    return () => {
      repositoryStore.unsubscribeToRepository(subscriptionId);
    };
  }, []);

  if (isDeleted) {
    return (
      <ScrollScreenContainer horizontalPadding>
        <Spacer />
        <Text>This note just has been deleted.</Text>
      </ScrollScreenContainer>
    );
  }

  if (yDocRef.current === null) {
    return (
      <View style={styles.container}>
        <Spacer />
        <LoadingView style={{ backgroundColor: colors.white }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidContainer>
      <ServerSyncInfo />
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={source}
        startInLoadingState={true}
        // can be activated once there is `Done` button
        // hideKeyboardAccessoryView={true}
        // to avoid weird scrolling behaviour when the keyboard becomes active
        scrollEnabled={false}
        renderLoading={() => (
          <View style={styles.container}>
            <Spacer />
            <LoadingView style={{ backgroundColor: colors.white }} />
          </View>
        )}
        onMessage={async (event) => {
          event.persist();
          const update = JSON.parse(event.nativeEvent.data);
          if (update.type === "content") {
            Y.applyUpdate(yDocRef.current, new Uint8Array(update.data));
            const serializedYDoc = Y.encodeStateAsUpdate(yDocRef.current);

            // optimization: prevent update in case the content hasn't changed
            if (deepEqual(serializedYDoc, contentRef.current)) return;

            const repo = await repositoryStore.getRepository(id);
            await repositoryStore.setRepository({
              ...repo,
              content: serializedYDoc,
              updatedAt: new Date().toISOString(),
            });
          } else if (update.type === "export-html") {
            console.log(update.data);
          }
        }}
        style={styles.webView}
        // Needed for .focus() to work
        keyboardDisplayRequiresUserAction={false}
        onLoad={() => {
          if (isNew) {
            webViewRef.current.injectJavaScript(`
              document.querySelector(".ProseMirror").focus();
              true;
            `);
            initializedRef.current = true;
          } else {
            webViewRef.current.injectJavaScript(`
              window.applyYjsUpdate(${JSON.stringify(
                Array.apply([], contentRef.current)
              )});
              true;
            `);
            webViewRef.current.injectJavaScript(`
              window.exportHtml();
              true;
            `);
            initializedRef.current = true;
          }
        }}
      />
    </KeyboardAvoidContainer>
  );
}
