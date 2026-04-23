import { createSignal } from "solid-js";

const [messageCounts, setMessageCounts] = createSignal<Record<string, number>>(
  {}
);

let unsubscribe: (() => void) | null = null;

function ensureSubscribed() {
  if (unsubscribe) return;
  unsubscribe = window.electronIPCHandlers.onMessageCount(
    ({ messageCount, tabId }) => {
      if (!tabId) return;
      setMessageCounts((prev) => {
        if (prev[tabId] === messageCount) return prev;
        return { ...prev, [tabId]: messageCount };
      });
    }
  );
}

// Subscribe once at module load. The listener lifecycle matches the window.
ensureSubscribed();

export { messageCounts };
