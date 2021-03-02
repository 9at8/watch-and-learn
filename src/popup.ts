import { getSettings, settingNameFromId } from "./settings";

async function main() {
  const settings = await getSettings();
  const list = document.querySelector("#settings-list")!;

  console.log(settings);

  settings.forEach((setting) => {
    const li = document.createElement("li");

    li.textContent = `${settingNameFromId(setting.id)} : ${setting.value}`;

    list.append(li);
  });
}

main();
