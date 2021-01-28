import videojs from "video.js";

function exponentialWait(
  check: () => boolean,
  limit: number = 10000,
  initialTimeout = 100
) {
  return new Promise<void>((resolve, reject) => {
    function wait(timeout: number) {
      setTimeout(() => {
        if (check()) {
          resolve();
        } else if (timeout > limit) {
          reject(`Timelimit "${limit}" exceeded`);
        } else {
          wait(timeout * 2);
        }
      }, timeout);
    }

    wait(initialTimeout);
  });
}

const DEFAULT_PLAYER_SELECTOR = "d2l-labs-media-player";

async function main() {
  const getPlayer = () => document.querySelector(DEFAULT_PLAYER_SELECTOR);
  await exponentialWait(() => getPlayer() != null, 10000, 50);

  const oldPlayer = getPlayer();
  const container = getPlayer()?.parentElement;

  const video = document.createElement("video");
  video.classList.add("video-js");
  video.controls = true;
  video.style.width = "100%";

  const source = document.createElement("source");
  source.src = oldPlayer?.getAttribute("src") ?? "";
  video.append(source);

  oldPlayer?.remove();
  container?.append(video);

  videojs(video, {
    src: oldPlayer?.getAttribute("src") ?? "",
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3],
  });
}

main();
