import videojs from 'video.js'

console.log(videojs)

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
  video.autoplay = true;
  // video.autoPictureInPicture = true;
  video.controls = true
  video.style.width = "100%";

  const source = document.createElement("source");
  video.append(source);

  source.src = oldPlayer?.getAttribute("src") ?? "";

  container?.append(video);
}

main();
