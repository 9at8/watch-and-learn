import { get, set } from "./storage";

export interface Settings {
  "binge.mode.enabled": boolean;
  "binge.next.wait.time": number;
  "disclaimer.accepted": boolean;
  "enable.extension": boolean;
  "playback.rate": number;
}

export const DEFAULT_SETTINGS: Settings = {
  "binge.mode.enabled": true,
  "binge.next.wait.time": 5,
  "disclaimer.accepted": false,
  "enable.extension": true,
  "playback.rate": 1,
};

const CHROME_SETTINGS_KEY = "settings";

export async function getSettings(): Promise<Settings> {
  let storedSettings = await get<Settings>(CHROME_SETTINGS_KEY);

  if (storedSettings == null) {
    await saveSettings(DEFAULT_SETTINGS);
  }

  return { ...DEFAULT_SETTINGS, ...storedSettings };
}

export const saveSettings = (settings: Settings) =>
  set(CHROME_SETTINGS_KEY, settings);

export function listenForSettingsUpdate(
  handleUpdate: (newSettings: Settings) => void,
) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") {
      return;
    }

    if (changes.settings != null) {
      handleUpdate(changes.settings.newValue);
    }
  });
}
