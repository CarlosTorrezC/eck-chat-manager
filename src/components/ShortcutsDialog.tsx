import { For, Show, type Accessor } from "solid-js";

type ShortcutGroup = { title: string; items: Array<[string, string]> };

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "ECK Chat Manager",
    items: [
      ["Ctrl+Shift+F", "Buscar en todas las cuentas"],
      ["Ctrl+Shift+D", "Abrir Panel Admin"],
      ["Ctrl+Shift+E", "Exportar conversacion activa a PDF"],
      ["Ctrl+Shift+U", "Buscar actualizaciones"],
      ["Ctrl+?", "Mostrar esta ayuda"],
      ["Esc", "Cerrar dialogos abiertos"],
    ],
  },
  {
    title: "Pestañas",
    items: [
      ["Ctrl+T", "Nueva pestaña"],
      ["Ctrl+W", "Cerrar pestaña"],
      ["Ctrl+Shift+T", "Restaurar pestaña cerrada"],
      ["Ctrl+Tab", "Siguiente pestaña"],
      ["Ctrl+Shift+Tab", "Pestaña anterior"],
    ],
  },
  {
    title: "WhatsApp (dentro del chat)",
    items: [
      ["Ctrl+B", "Negrita"],
      ["Ctrl+I", "Itálica"],
      ["Ctrl+S", "Tachado"],
      ["Ctrl+M", "Monospaced"],
      ["Ctrl++", "Zoom in"],
      ["Ctrl+-", "Zoom out"],
      ["Ctrl+0", "Reset zoom"],
    ],
  },
];

const ShortcutsDialog = (props: {
  isOpen: Accessor<boolean>;
  close: () => void;
}) => {
  return (
    <Show when={props.isOpen()}>
      <div
        class="fixed inset-0 z-[55] bg-black/40"
        onClick={props.close}
        aria-hidden="true"
      />
      <div
        class="fixed left-1/2 top-12 z-[60] max-h-[80vh] w-[30rem] -translate-x-1/2 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Atajos de teclado"
      >
        <div class="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div class="text-sm font-semibold text-white">Atajos de teclado</div>
          <button
            class="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            onClick={props.close}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div class="flex-1 overflow-auto px-4 py-3">
          <For each={shortcutGroups}>
            {(group) => (
              <div class="mb-4">
                <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {group.title}
                </div>
                <div class="divide-y divide-slate-800">
                  <For each={group.items}>
                    {([key, desc]) => (
                      <div class="flex items-center justify-between gap-4 py-1.5">
                        <span class="text-sm text-slate-300">{desc}</span>
                        <kbd class="rounded bg-slate-800 px-2 py-0.5 font-mono text-[0.7rem] text-slate-200 ring-1 ring-slate-700">
                          {key}
                        </kbd>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
};

export default ShortcutsDialog;
