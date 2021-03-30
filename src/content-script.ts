import { getSettings, saveSettings, Settings } from "./settings";

function exponentialWait(
  check: () => boolean,
  limit: number = 10000,
  initialTimeout = 50
) {
  return new Promise<void>((resolve, reject) => {
    function wait(timeout: number) {
      setTimeout(() => {
        if (check()) {
          resolve();
        } else if (timeout > limit) {
          reject(
            `[watch-and-learn] Could not find video player in timelimit ${limit} ms.`
          );
        } else {
          wait(timeout * 2);
        }
      }, timeout);
    }

    wait(initialTimeout);
  });
}

function applySettings(video: HTMLVideoElement, settings: Settings): void {
  video.playbackRate = settings["playback.rate"];
}

const DEFAULT_PLAYER_SELECTOR = "d2l-labs-media-player";

async function main() {
  const getPlayer = () => document.querySelector(DEFAULT_PLAYER_SELECTOR);

  const [settings, _] = await Promise.all([
    getSettings(),
    exponentialWait(() => getPlayer() != null),
  ]);

  if (!settings["enable.extension"]) {
    return;
  }

  if (!settings["disclaimer.accepted"]) {
    if (
      confirm(`Disclaimer:
- "Watch and Learn" is not affiliated with UWaterloo, Learn, or its developers.
- Use "Watch and Learn" at your own responsibility.

Click "Ok" to accept this disclaimer.`)
    ) {
      await saveSettings({ ...settings, "disclaimer.accepted": true });
    } else {
      return;
    }
  }

  const oldPlayer = getPlayer();
  const container = oldPlayer?.parentElement;

  const video = document.createElement("video");
  video.classList.add("video-js");
  video.style.width = "100%";

  oldPlayer?.remove();
  container?.append(video);

  videojs(video, {
    controls: true,
    sources:
      oldPlayer == null ? [] : [{ src: oldPlayer.getAttribute("src") ?? "" }],
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3],
  }).ready(function () {
    this.hotkeys();

    applySettings(video, settings);
  });
}

main();
