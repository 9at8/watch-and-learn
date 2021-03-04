import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  Settings,
} from "./settings";
import { $, $find } from "./utils";

abstract class SettingModel<T> {
  constructor(public id: keyof Settings, public value: T) {}

  abstract render(): HTMLElement;
  abstract getLatestValue(): T;

  get name(): string {
    return this.id
      .split(".")
      .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(" ");
  }
}

class NumberSettingModel extends SettingModel<number> {
  private control: HTMLInputElement | undefined;

  render(): HTMLElement {
    const nameSpan = $("span");
    nameSpan.textContent = `${this.name}: `;
    this.control = $("input", { type: "number", value: this.value.toString() });

    if (this.id === "playback.rate") {
      this.control.step = "0.05";
      this.control.min = "0";
    }

    return $("div", {}, [$("label", {}, [nameSpan, this.control])]);
  }

  getLatestValue(): number {
    if (this.control == null) {
      throw new Error("Setting is not rendered");
    }

    return +this.control.value;
  }
}

function createModelsFromSettings(
  settings: Settings
): SettingModel<Settings[keyof Settings]>[] {
  return Object.entries(settings).map(([id, value]) => {
    switch (typeof value) {
      case "number":
        return new NumberSettingModel(id as keyof Settings, value);
      default:
        throw Error("Not implemented yet");
    }
  });
}

function createSettingsFromModels(
  models: SettingModel<Settings[keyof Settings]>[]
): Settings {
  return models.reduce(
    (settingsSoFar, model) => ({
      ...settingsSoFar,
      [model.id]: model.getLatestValue(),
    }),
    {}
  ) as Settings;
}

async function main() {
  const form = $find<HTMLFormElement>("#settings-form")!;
  const container = $find("#settings-container")!;

  console.log("form", form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    saveSettings(createSettingsFromModels(models));
  });

  form.addEventListener("reset", async (event) => {
    event.preventDefault();

    await saveSettings(DEFAULT_SETTINGS);
    models = createModelsFromSettings(DEFAULT_SETTINGS);
  });

  let models = createModelsFromSettings(await getSettings());
  container.append(...models.flatMap((model) => model.render()));
}

main();
