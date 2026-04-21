import { For, Show, createMemo, type Accessor } from "solid-js";
import { stableTabArray, setTabActive } from "../stores/tabs/solid";
import { messageCounts } from "../stores/messageCounts";

const AdminDashboard = (props: {
  isOpen: Accessor<boolean>;
  close: () => void;
}) => {
  const sortedTabs = createMemo(() => {
    const counts = messageCounts();
    return [...stableTabArray()].sort(
      (a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)
    );
  });

  const totalUnread = createMemo(() => {
    const counts = messageCounts();
    return Object.values(counts).reduce((sum, n) => sum + n, 0);
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
              return (
                <button
                  class="w-full rounded px-3 py-2.5 text-left hover:bg-slate-800"
                  onClick={() => jumpTo(tab.id)}
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="truncate text-sm font-medium text-white">
                      {tab.name}
                    </span>
                    <span
                      class={
                        count() > 0
                          ? "ml-2 shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[0.65rem] font-semibold text-white"
                          : "ml-2 shrink-0 text-[0.65rem] text-slate-500"
                      }
                    >
                      {count() > 99 ? "99+" : count() || "—"}
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
