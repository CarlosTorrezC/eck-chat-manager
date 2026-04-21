import { createSignal } from "solid-js";

const [messageCounts, setMessageCounts] = createSignal<Record<string, number>>(
  {}
);

window.electronIPCHandlers.onMessageCount(({ messageCount, tabId }) => {
  if (!tabId) return;
  setMessageCounts((prev) => {
    if (prev[tabId] === messageCount) return prev;
    return { ...prev, [tabId]: messageCount };
  });
});

export { messageCounts };
