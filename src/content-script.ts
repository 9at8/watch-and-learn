import { getData, setData } from "./data";
import { getSettings, saveSettings, Settings } from "./settings";
import { $, $find, exponentialWait } from "./utils";

const DISCLAIMER_TEXT = `Disclaimer:
- "Watch and Learn" is not affiliated with UWaterloo, Learn, or its developers.
- Use "Watch and Learn" at your own responsibility.

Click "Ok" to accept this disclaimer.`;

const DEFAULT_PLAYER_SELECTOR = "d2l-labs-media-player";

const BINGE_DIALOG_ID = "WAL-binge-dialog";
const BINGE_DESC_ID = "WAL-binge-title";
const BINGE_CANCEL_ID = "WAL-binge-cancel";
const BINGE_NEXT_ID = "WAL-binge-next";
const BINGE_PROGRESS_ID = "WAL-binge-progress";

const BINGE_DIALOG_SELECTOR = `#${BINGE_DIALOG_ID}`;
const BINGE_DESC_SELECTOR = `#${BINGE_DESC_ID}`;
const BINGE_CANCEL_SELECTOR = `#${BINGE_CANCEL_ID}`;
const BINGE_NEXT_SELECTOR = `#${BINGE_NEXT_ID}`;
const BINGE_PROGRESS_SELECTOR = `#${BINGE_PROGRESS_ID}`;

async function main() {
  const getPlayer = () => $find(DEFAULT_PLAYER_SELECTOR);

  const [settings, _] = await Promise.all([
    getSettings(),
    exponentialWait(() => getPlayer() != null),
  ]);

  if (!settings["enable.extension"]) {
    return;
  }

  if (!settings["disclaimer.accepted"]) {
    if (confirm(DISCLAIMER_TEXT)) {
      await saveSettings({ ...settings, "disclaimer.accepted": true });
    } else {
      return;
    }
  }

  const oldPlayer = getPlayer();
  const container = oldPlayer?.parentElement;

  const video = $("video", { class: "video-js", style: "width: 100%" });

  oldPlayer?.remove();
  container?.append(video);

  videojs(video, {
    controls: true,
    sources:
      oldPlayer == null ? [] : [{ src: oldPlayer.getAttribute("src") ?? "" }],
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3],
  }).ready(function () {
    this.hotkeys();

    video.parentElement?.appendChild(
      $(
        "div",
        {
          id: BINGE_DIALOG_ID,
          class: "vjs-modal-dialog vjs-hidden",
          style: `
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            font-size: 1rem;
      `,
        },
        [
          $("div", { id: BINGE_DESC_ID, style: "margin: 1rem;" }),
          $("progress", { id: BINGE_PROGRESS_ID }),
          $("div", { style: "margin: 1rem;" }, [
            $("button", { id: BINGE_CANCEL_ID, class: "vjs-default-button" }),
            $("button", { id: BINGE_NEXT_ID, class: "vjs-default-button" }),
          ]),
        ],
      ),
    );

    applySettings(video, settings);
  });
}

async function applySettings(video: HTMLVideoElement, settings: Settings) {
  video.playbackRate = settings["playback.rate"];

  if (settings["binge.mode.enabled"]) {
    await applyBingeSettings(video, settings);
  }
}

async function applyBingeSettings(video: HTMLVideoElement, settings: Settings) {
  if (await ongoingBinge()) {
    video.play();
  }

  const binge = await getBingeInfo();

  // next page is not a video
  if (binge == null) {
    return;
  }

  const ui = getBingeUI();
  let timer: number | undefined;

  video.addEventListener("ended", () => {
    const step = 1000;
    let currStep = 0;
    const totalSteps = (settings["binge.next.wait.time"] * 1000) / step;
    ui.progress.max = totalSteps;
    ui.setTitle(binge.title);

    timer = window.setInterval(() => {
      if (currStep >= totalSteps) {
        window.clearInterval(timer);
        binge.next();
      }

      ui.progress.value = ++currStep;
    }, step);

    ui.show();
  });

  ui.cancel.addEventListener("click", () => {
    window.clearInterval(timer);
    ui.progress.value = 0;
    ui.hide();
  });

  ui.next.addEventListener("click", binge.next);
}

function getBingeUI() {
  const dialog = $find(BINGE_DIALOG_SELECTOR)!;
  const desc = $find(BINGE_DESC_SELECTOR)!;
  const cancel = $find<HTMLButtonElement>(BINGE_CANCEL_SELECTOR)!;
  const next = $find<HTMLButtonElement>(BINGE_NEXT_SELECTOR)!;
  const progress = $find<HTMLProgressElement>(BINGE_PROGRESS_SELECTOR)!;

  progress.value = 0;
  next.innerText = "Play";
  cancel.innerText = "Cancel";

  return {
    cancel,
    next,
    progress,
    hide: () => dialog.classList.add("vjs-hidden"),
    show: () => dialog.classList.remove("vjs-hidden"),
    setTitle: (title: string) => (desc.innerText = `Next up: ${title}`),
  };
}

async function ongoingBinge(): Promise<boolean> {
  const data = await getData();
  const pageTitle = document.querySelector("title");

  return (
    data?.nextBingeTitle == pageTitle?.text && data?.nextBingeTitle != null
  );
}

interface BingeInfo {
  title: string;
  next(): void;
}

async function getBingeInfo(): Promise<BingeInfo | undefined> {
  const iterator = $find(".d2l-iterator");

  if (iterator == null) {
    return;
  }

  const nextButton = iterator.querySelector<HTMLAnchorElement>(
    ".d2l-iterator-button-next",
  );

  if (nextButton == null) {
    return;
  }

  const nextPage = $("div");
  nextPage.innerHTML = await (await fetch(nextButton.href)).text();

  const hasVideoPlayer = Boolean(nextPage.querySelector(".vui-mediaplayer"));

  if (!hasVideoPlayer) {
    return;
  }

  const title = nextPage.querySelector("title")!.text;

  const next = async () => {
    await setData({ nextBingeTitle: title });
    nextButton.click();
  };

  return { title, next };
}

main();
