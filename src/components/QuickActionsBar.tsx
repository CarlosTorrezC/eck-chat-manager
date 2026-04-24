import { Component } from "solid-js";

interface Props {
  onOpenDashboard: () => void;
  onOpenSearch: () => void;
  onExportPdf: () => void;
  onOpenShortcuts: () => void;
}

const btnClass =
  "flex h-7 w-7 items-center justify-center rounded text-slate-300 hover:bg-slate-700 hover:text-white";

const QuickActionsBar: Component<Props> = (props) => {
  return (
    <div
      class="fixed right-2 top-1 z-40 flex items-center gap-0.5 rounded-md bg-slate-900/80 px-1 py-0.5 ring-1 ring-slate-700 backdrop-blur"
      style={{ "-webkit-app-region": "no-drag" }}
      aria-label="Acciones rapidas"
    >
      <button
        class={btnClass}
        onClick={props.onOpenDashboard}
        title="Panel Admin (Ctrl+Shift+D)"
        aria-label="Panel Admin"
      >
        {/* dashboard icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      </button>
      <button
        class={btnClass}
        onClick={props.onOpenSearch}
        title="Buscar en todas las cuentas (Ctrl+Shift+F)"
        aria-label="Buscar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      <button
        class={btnClass}
        onClick={props.onExportPdf}
        title="Exportar conversacion a PDF (Ctrl+Shift+E)"
        aria-label="Exportar PDF"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      <button
        class={btnClass}
        onClick={props.onOpenShortcuts}
        title="Atajos de teclado (Ctrl+?)"
        aria-label="Atajos"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    </div>
  );
};

export default QuickActionsBar;
