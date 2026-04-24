import { createSignal } from "solid-js";

export type ActivityEntry = {
  timestamp: number;
  tabId: string;
  tabName: string;
  action: "open";
};

const STORAGE_KEY = "eck-activity-log";
const MAX_ENTRIES = 100;

function load(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

const [activityLog, setActivityLog] = createSignal<ActivityEntry[]>(load());

export function recordActivity(entry: ActivityEntry): void {
  setActivityLog((prev) => {
    // Coalesce: ignore if same tab as the last entry within 10s
    const last = prev[0];
    if (
      last &&
      last.tabId === entry.tabId &&
      entry.timestamp - last.timestamp < 10_000
    ) {
      return prev;
    }
    const next = [entry, ...prev].slice(0, MAX_ENTRIES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    return next;
  });
}

export function clearActivityLog(): void {
  setActivityLog([]);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export { activityLog };
