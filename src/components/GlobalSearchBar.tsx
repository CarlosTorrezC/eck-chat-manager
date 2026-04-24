import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  type Accessor,
} from "solid-js";
import { stableTabArray, setTabActive } from "../stores/tabs/solid";
import { WebviewTag } from "electron";

interface FoundInPageEvent extends Event {
  result: {
    requestId: number;
    finalUpdate: boolean;
    matches?: number;
    activeMatchOrdinal?: number;
  };
}

type Results = Map<string, number>;

function getWebview(tabId: string): WebviewTag | null {
  return document.getElementById(`webview-${tabId}`) as WebviewTag | null;
}

async function countMatchesInWebview(
  webview: WebviewTag,
  query: string,
  timeoutMs = 2000
): Promise<number> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (n: number) => {
      if (settled) return;
      settled = true;
      webview.removeEventListener("found-in-page", handler as EventListener);
      try {
        webview.stopFindInPage("clearSelection");
      } catch {
        // webview may have been detached
      }
      resolve(n);
    };

    const handler = (event: Event) => {
      const { result } = event as FoundInPageEvent;
      if (result.finalUpdate) finish(result.matches ?? 0);
    };

    webview.addEventListener("found-in-page", handler as EventListener);
    try {
      webview.findInPage(query);
    } catch {
      finish(0);
      return;
    }

    setTimeout(() => finish(0), timeoutMs);
  });
}

const GlobalSearchBar = (props: {
  isOpen: Accessor<boolean>;
  close: () => void;
}) => {
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<Results>(new Map());
  const [loading, setLoading] = createSignal(false);

  // Debounce: auto-search 400ms after the user stops typing.
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  createEffect(() => {
    const q = query();
    if (!props.isOpen()) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!q.trim()) {
      setResults(new Map());
      return;
    }
    debounceTimer = setTimeout(() => {
      void runSearch();
    }, 400);
  });
  onCleanup(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  const runSearch = async () => {
    const q = query().trim();
    if (!q) {
      setResults(new Map());
      return;
    }
    setLoading(true);
    const next: Results = new Map();
    for (const tab of stableTabArray()) {
      const webview = getWebview(tab.id);
      if (!webview) {
        next.set(tab.id, 0);
        continue;
      }
      const matches = await countMatchesInWebview(webview, q);
      next.set(tab.id, matches);
    }
    setResults(next);
    setLoading(false);
  };

  const jumpToTab = (tabId: string) => {
    setTabActive(tabId);
    const webview = getWebview(tabId);
    if (webview && query().trim()) {
      try {
        webview.findInPage(query());
      } catch {
        // ignore
      }
    }
    props.close();
  };

  const totalMatches = () => {
    let total = 0;
    for (const n of results().values()) total += n;
    return total;
  };

  return (
    <Show when={props.isOpen()}>
      <div
        class="fixed top-12 right-4 z-[60] w-96 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-2xl"
        role="dialog"
        aria-label="Busqueda global"
      >
        <div class="flex items-center gap-2">
          <input
            class="flex-1 rounded bg-slate-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            placeholder="Buscar en todas las cuentas…"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch();
              if (e.key === "Escape") props.close();
            }}
            autofocus
          />
          <button
            class="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            onClick={() => void runSearch()}
            disabled={loading() || !query().trim()}
          >
            {loading() ? "…" : "Buscar"}
          </button>
        </div>

        <Show when={results().size > 0 && !loading()}>
          <div class="mt-3 text-xs text-slate-400">
            {totalMatches()} coincidencia{totalMatches() === 1 ? "" : "s"} en{" "}
            {results().size} cuenta{results().size === 1 ? "" : "s"}
          </div>
          <div class="mt-1 max-h-64 overflow-auto">
            <For each={stableTabArray()}>
              {(tab) => {
                const count = () => results().get(tab.id) ?? 0;
                return (
                  <button
                    class="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    disabled={count() === 0}
                    onClick={() => jumpToTab(tab.id)}
                  >
                    <span class="truncate">{tab.name}</span>
                    <span
                      class={
                        count() > 0
                          ? "ml-2 rounded bg-emerald-600 px-2 py-0.5 text-xs"
                          : "ml-2 text-xs text-slate-500"
                      }
                    >
                      {count()}
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
        </Show>

        <div class="mt-3 flex justify-between text-[11px] text-slate-500">
          <span>Enter: buscar · Esc: cerrar</span>
          <button
            class="hover:text-slate-300"
            onClick={props.close}
            aria-label="Cerrar busqueda"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Show>
  );
};

export default GlobalSearchBar;
