import { createSignal } from "solid-js";

const [messageCounts, setMessageCounts] = createSignal<Record<string, number>>(
  {}
);

// Timestamp (ms) when each tab went from 0 -> N unread messages.
// Reset to 0 when the count returns to 0 (admin opened it).
const [unreadSince, setUnreadSince] = createSignal<Record<string, number>>({});

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
      setUnreadSince((prev) => {
        const had = (prev[tabId] ?? 0) > 0;
        if (messageCount > 0 && !had) {
          return { ...prev, [tabId]: Date.now() };
        }
        if (messageCount === 0 && had) {
          const next = { ...prev };
          delete next[tabId];
          return next;
        }
        return prev;
      });
    }
  );
}

ensureSubscribed();

/** How long (ms) a tab has had unread messages waiting, or 0 if none. */
export function unreadAgeMs(tabId: string): number {
  const since = unreadSince()[tabId];
  if (!since) return 0;
  return Date.now() - since;
}

export { messageCounts, unreadSince };
