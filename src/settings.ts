export interface BoolSetting {
  type: "bool";
  id: string;
  value: boolean;
}

export interface NumberSetting {
  type: "number";
  id: string;
  value: number;
}

export type Setting = BoolSetting | NumberSetting;

export const DEFAULT_SETTINGS: Setting[] = [
  { type: "number", id: "playback.speed", value: 1 },
];

const SETTINGS_KEY = "settings";

export async function getSettings(): Promise<Setting[]> {
  let storedSettings = await new Promise<Setting[] | undefined>((resolve) => {
    chrome.storage.local.get(SETTINGS_KEY, (items) => resolve(items.settings));
  });

  if (storedSettings == null || storedSettings.length === 0) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS }, resolve);
    });

    storedSettings = DEFAULT_SETTINGS;
  }

  return storedSettings;
}

export function settingNameFromId(id: string): string {
  return id
    .split(".")
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
