import {
  type Component,
  onMount,
  onCleanup,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { type Tab } from "../stores/tabs/common";
import { WebviewTag } from "electron";
import { themeStore } from "../stores/themes/solid";
import { unwrap } from "solid-js/store";

const WebView: Component<{ tab: Tab }> = (props) => {
  let webviewRef: WebviewTag | undefined;
  const [didStopLoading, setDidStopLoading] = createSignal(false);

  const selectedTheme = createMemo(() => {
    return unwrap(
      themeStore.themes.find((theme) => theme.id === props.tab.config.theme)
    );
  });

  createEffect(() => {
    if (!webviewRef) return;
    if (!didStopLoading()) return;

    webviewRef.send("set-theme", selectedTheme());
  });

  createEffect(() => {
    if (!webviewRef) return;
    if (!didStopLoading()) return;

    webviewRef.setAudioMuted(!props.tab.config.sound);
  });

  createEffect(() => {
    if (!webviewRef) return;
    if (!didStopLoading()) return;

    window.initPermissionHandler(`persist:${props.tab.id}`);
  });

  createEffect(() => {
    if (!webviewRef) return;
    if (!didStopLoading()) return;

    window.toggleNotifications(
      props.tab.config.notifications,
      `persist:${props.tab.id}`
    );
    window.toggleMediaPermission(
      props.tab.config.media,
      `persist:${props.tab.id}`
    );
  });

  createEffect(() => {
    if (!webviewRef) return;
    if (!didStopLoading()) return;

    webviewRef.send("set-id", props.tab.id);
  });

  onMount(() => {
    const webview = webviewRef;

    if (!webview) {
      return;
    }

    const onStopLoading = () => {
      setDidStopLoading(false);
      setDidStopLoading(true);
    };
    const onFocus = () => {
      const anyOpenTitlebarMenu = document.querySelector(
        "[data-custom-titlebar-menu] > [data-expanded]"
      );
      if (!anyOpenTitlebarMenu) return;
      anyOpenTitlebarMenu.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
        })
      );
    };

    webview.addEventListener("did-stop-loading", onStopLoading);
    webview.addEventListener("focus", onFocus);

    onCleanup(() => {
      webview.removeEventListener("did-stop-loading", onStopLoading);
      webview.removeEventListener("focus", onFocus);
    });
  });

  return (
    <webview
      ref={webviewRef}
      class="w-full h-full"
      id={`webview-${props.tab.id}`}
      src="https://web.whatsapp.com"
      partition={`persist:${props.tab.id}`}
      preload={window.whatsappPreloadPath}
      webpreferences={`spellcheck=${props.tab.config.spellChecker}`}
    />
  );
};

export default WebView;
