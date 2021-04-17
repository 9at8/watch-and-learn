export function get<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (items) => resolve(items[key]));
  });
}

export function set(key: string, data: unknown): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set({ [key]: data }, resolve);
  });
}
