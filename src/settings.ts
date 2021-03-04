export interface Settings {
  "playback.rate": number;
}

export const DEFAULT_SETTINGS: Settings = {
  "playback.rate": 1,
};

export async function getSettings(): Promise<Settings> {
  let storedSettings = await getSettingsFromStorage();

  if (storedSettings == null) {
    await saveSettings(DEFAULT_SETTINGS);
    storedSettings = DEFAULT_SETTINGS;
  }

  return storedSettings;
}

export function saveSettings(settings: Settings): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.local.set({ [CHROME_SETTINGS_KEY]: settings }, resolve);
  });
}

const CHROME_SETTINGS_KEY = "settings";

function getSettingsFromStorage(): Promise<Settings | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(CHROME_SETTINGS_KEY, (items) =>
      resolve(items.settings)
    );
  });
}

export interface SettingsUpdateMessage {
  settingsUpdate: Settings;
}

export function listenForSettingsUpdate(
  handleUpdate: (newSettings: Settings) => void
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
