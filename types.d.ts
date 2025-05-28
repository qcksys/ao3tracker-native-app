declare module "*.webjs" {
  const source: string;
  export default source;
}

declare const webkit: Webkit;

interface Window {
  webkit: Webkit;
  /**
   * A convenience API that we seem to expose in iOS.
   * Not sure whether Android does the same.
   * @see: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L1128-L1146
   */
  ReactNativeWebView: {
    postMessage(msg: string): void;
  };
}

interface Webkit {
  messageHandlers: {
    /**
     * Added due to our call to addScriptMessageHandler.
     * @see: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L1244
     */
    ReactNativeWebView: {
      postMessage(message: string): void;
    };
    /**
     * Added due to our call to addScriptMessageHandler.
     * @see: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L214
     */
    ReactNativeHistoryShim: {
      postMessage(message: string): void;
    };
  };
}
