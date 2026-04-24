import {
  For,
  type Component,
  createSignal,
  createResource,
  onCleanup,
  onMount,
} from "solid-js";
import { getActiveWebviewElement, stableTabArray, tabStore } from "./stores/tabs/solid";
import WebView from "./components/WebView";
import TabsList from "./components/TabsList";
import SettingsDialog from "./components/SettingsDialog";
import { twJoin } from "tailwind-merge";
import { getSettingValue } from "./stores/settings/solid";
import CustomTitlebar from "./components/CustomTitlebar";
import { I18NProvider } from "./i18n/solid";
import ThemeManagerDialog from "./components/ThemeManagerDialog";
import GlobalSearchBar from "./components/GlobalSearchBar";
import AdminDashboard from "./components/AdminDashboard";
import "./stores/messageCounts";

const App: Component = () => {
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const [isThemeManagerOpen, setIsThemeManagerOpen] = createSignal(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = createSignal(false);
  const [isDashboardOpen, setIsDashboardOpen] = createSignal(false);
  const [menu, { refetch: refetchAppMenu }] = createResource(window.getAppMenu);

  async function exportActiveTabToPdf(): Promise<void> {
    const webview = getActiveWebviewElement();
    if (!webview) return;
    const activeTab = tabStore.tabs.find(
      (t) => t.id === tabStore.selectedTabId
    );
    const safeName =
      (activeTab?.name ?? "conversacion")
        .replace(/[^a-z0-9_\-\s]/gi, "")
        .trim()
        .replace(/\s+/g, "_") || "conversacion";
    const date = new Date().toISOString().slice(0, 10);
    try {
      const data = (await webview.printToPDF({
        landscape: false,
        printBackground: true,
        pageSize: "A4",
        margins: { marginType: "default" },
      })) as unknown as Uint8Array;
      await window.savePdf({
        defaultName: `${safeName}_${date}.pdf`,
        data,
      });
    } catch (error) {
      console.error("Export PDF failed", error);
    }
  }

  const handlers = new Set<() => void>();
  onCleanup(() => {
    for (const cleanup of handlers) {
      cleanup();
    }
  });

  onMount(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod || !event.shiftKey) return;
      const key = event.key.toLowerCase();
      if (key === "f") {
        event.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      } else if (key === "d") {
        event.preventDefault();
        setIsDashboardOpen((prev) => !prev);
      } else if (key === "e") {
        event.preventDefault();
        void exportActiveTabToPdf();
      }
    };
    const onKeyDownEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isDashboardOpen()) setIsDashboardOpen(false);
        if (isGlobalSearchOpen()) setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keydown", onKeyDownEscape);
    handlers.add(() => window.removeEventListener("keydown", onKeyDown));
    handlers.add(() => window.removeEventListener("keydown", onKeyDownEscape));

    handlers.add(
      window.electronIPCHandlers.onOpenSettings(() => {
        setIsSettingsOpen(true);
      })
    );
    handlers.add(
      window.electronIPCHandlers.onOpenThemeManager(() => {
        setIsThemeManagerOpen(true);
      })
    );
    handlers.add(
      window.electronIPCHandlers.onReloadCustomTitleBar(refetchAppMenu)
    );
  });

  return (
    <I18NProvider>
      <div class="flex flex-col h-full">
        {getSettingValue("customTitlebar") && window.platform !== "darwin" && (
          <CustomTitlebar menu={menu} />
        )}
        <div
          class={twJoin(
            "h-full flex overflow-hidden",
            getSettingValue("tabBarPosition") === "top"
              ? "flex-col"
              : "flex-col-reverse"
          )}
        >
          <TabsList />
          <For each={stableTabArray()}>
            {(tab) => (
              <div
                role="tabpanel"
                id={`tabpanel-${tab.id}`}
                class={twJoin(
                  "min-h-0 flex-grow text-white",
                  tabStore.selectedTabId !== tab.id && "hidden"
                )}
              >
                <WebView tab={tab} />
              </div>
            )}
          </For>
        </div>
        <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
        <ThemeManagerDialog
          isOpen={isThemeManagerOpen}
          setIsOpen={setIsThemeManagerOpen}
        />
        <GlobalSearchBar
          isOpen={isGlobalSearchOpen}
          close={() => setIsGlobalSearchOpen(false)}
        />
        <AdminDashboard
          isOpen={isDashboardOpen}
          close={() => setIsDashboardOpen(false)}
        />
      </div>
    </I18NProvider>
  );
};

export default App;
