import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  type Accessor,
} from "solid-js";
import { stableTabArray, setTabActive, tabStore } from "../stores/tabs/solid";
import { messageCounts, unreadSince } from "../stores/messageCounts";

const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

function formatAge(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours}h` : `${hours}h ${rem}m`;
}

const AdminDashboard = (props: {
  isOpen: Accessor<boolean>;
  close: () => void;
}) => {
  const [now, setNow] = createSignal(Date.now());
  onMount(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    onCleanup(() => clearInterval(interval));
  });

  const sortedTabs = createMemo(() => {
    const counts = messageCounts();
    const since = unreadSince();
    return [...stableTabArray()].sort((a, b) => {
      // Stale (age > threshold) first, then by unread count.
      const ageA = since[a.id] ? now() - since[a.id] : 0;
      const ageB = since[b.id] ? now() - since[b.id] : 0;
      const staleA = ageA > STALE_THRESHOLD_MS ? 1 : 0;
      const staleB = ageB > STALE_THRESHOLD_MS ? 1 : 0;
      if (staleA !== staleB) return staleB - staleA;
      return (counts[b.id] ?? 0) - (counts[a.id] ?? 0);
    });
  });

  const totalUnread = createMemo(() => {
    const counts = messageCounts();
    return Object.values(counts).reduce((sum, n) => sum + n, 0);
  });

  const staleCount = createMemo(() => {
    const since = unreadSince();
    const t = now();
    let n = 0;
    for (const ts of Object.values(since)) {
      if (t - ts > STALE_THRESHOLD_MS) n++;
    }
    return n;
  });

  const jumpTo = (tabId: string) => {
    setTabActive(tabId);
    props.close();
  };

  return (
    <Show when={props.isOpen()}>
      <div
        class="fixed inset-0 z-[55] bg-black/40"
        onClick={props.close}
        aria-hidden="true"
      />
      <div
        class="fixed top-12 right-4 z-[60] w-[26rem] max-h-[80vh] overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Panel de administracion"
      >
        <div class="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div>
            <div class="text-sm font-semibold text-white">Panel Admin</div>
            <div class="text-xs text-slate-400">
              {totalUnread()} mensaje{totalUnread() === 1 ? "" : "s"} sin leer
              en {sortedTabs().length} cuenta
              {sortedTabs().length === 1 ? "" : "s"}
            </div>
            <Show when={staleCount() > 0}>
              <div class="mt-1 text-xs font-semibold text-orange-400">
                ⚠ {staleCount()} cuenta{staleCount() === 1 ? "" : "s"} sin
                responder &gt;30 min
              </div>
            </Show>
          </div>
          <button
            class="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            onClick={props.close}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div class="flex-1 overflow-auto px-2 py-2">
          <For each={sortedTabs()}>
            {(tab) => {
              const count = () => messageCounts()[tab.id] ?? 0;
              const isActive = () => tabStore.selectedTabId === tab.id;
              const since = () => unreadSince()[tab.id];
              const age = () => (since() ? now() - since()! : 0);
              const isStale = () => age() > STALE_THRESHOLD_MS;
              return (
                <button
                  class={
                    isActive()
                      ? "w-full rounded px-3 py-2.5 text-left bg-slate-800 ring-1 ring-emerald-500"
                      : "w-full rounded px-3 py-2.5 text-left hover:bg-slate-800"
                  }
                  onClick={() => jumpTo(tab.id)}
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="flex items-center gap-1.5 min-w-0">
                      <Show when={isActive()}>
                        <span
                          class="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                          title="Activo ahora"
                        />
                      </Show>
                      <span class="truncate text-sm font-medium text-white">
                        {tab.name}
                      </span>
                    </span>
                    <span class="flex items-center gap-1 shrink-0">
                      <Show when={count() > 0 && age() > 0}>
                        <span
                          class={
                            isStale()
                              ? "rounded px-1.5 py-0.5 text-[0.6rem] font-semibold bg-orange-600 text-white"
                              : "rounded px-1.5 py-0.5 text-[0.6rem] text-slate-400 bg-slate-700/50"
                          }
                          title={
                            isStale()
                              ? "Sin responder hace mas de 30 min"
                              : "Tiempo con mensajes pendientes"
                          }
                        >
                          {formatAge(age())}
                        </span>
                      </Show>
                      <span
                        class={
                          count() > 0
                            ? "rounded-full bg-red-600 px-2 py-0.5 text-[0.65rem] font-semibold text-white"
                            : "text-[0.65rem] text-slate-500"
                        }
                      >
                        {count() > 99 ? "99+" : count() || "—"}
                      </span>
                    </span>
                  </div>
                  <Show when={tab.tags && tab.tags.length > 0}>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <For each={tab.tags}>
                        {(tag) => (
                          <span class="rounded bg-emerald-700/60 px-1.5 py-0.5 text-[0.6rem] leading-none text-white">
                            {tag}
                          </span>
                        )}
                      </For>
                    </div>
                  </Show>
                  <Show when={tab.note && tab.note.trim()}>
                    <div class="mt-1 line-clamp-2 text-[0.7rem] text-slate-400">
                      {tab.note}
                    </div>
                  </Show>
                </button>
              );
            }}
          </For>
          <Show when={sortedTabs().length === 0}>
            <div class="p-6 text-center text-sm text-slate-500">
              Aún no hay cuentas configuradas.
            </div>
          </Show>
        </div>

        <div class="border-t border-slate-700 px-4 py-2 text-[11px] text-slate-500">
          Ctrl+Shift+D para abrir/cerrar · Esc para salir
        </div>
      </div>
    </Show>
  );
};

export default AdminDashboard;
