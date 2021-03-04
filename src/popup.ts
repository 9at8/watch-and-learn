import {
  DEFAULT_SETTINGS,
  getSettings,
  listenForSettingsUpdate,
  saveSettings,
  Settings,
} from "./settings";
import { $, $find } from "./utils";

type GenericSettingModel = SettingModel<Settings[keyof Settings]>;

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

function createModelsFromSettings(settings: Settings): GenericSettingModel[] {
  return Object.entries(settings).map(([id, value]) => {
    switch (typeof value) {
      case "number":
        return new NumberSettingModel(id as keyof Settings, value);
      default:
        throw Error("Not implemented yet");
    }
  });
}

function createSettingsFromModels(models: GenericSettingModel[]): Settings {
  return models.reduce(
    (settingsSoFar, model) => ({
      ...settingsSoFar,
      [model.id]: model.getLatestValue(),
    }),
    {}
  ) as Settings;
}

function renderSettings(
  settings: Settings
): [HTMLElement, GenericSettingModel[]] {
  const models = createModelsFromSettings(settings);

  return [
    $(
      "div",
      {},
      models.map((model) => model.render())
    ),
    models,
  ];
}

async function main() {
  const form = $find<HTMLFormElement>("#settings-form")!;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    saveSettings(createSettingsFromModels(models));
  });

  form.addEventListener("reset", (event) => {
    event.preventDefault();

    saveSettings(DEFAULT_SETTINGS);
  });

  listenForSettingsUpdate((newSettings) => {
    container.remove();
    [container, models] = renderSettings(newSettings);
    form.prepend(container);
  });

  let [container, models] = renderSettings(await getSettings());
  form.prepend(container);
}

main();
