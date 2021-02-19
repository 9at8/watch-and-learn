import type { VideoJsPlayerOptions, VideoJsPlayer } from "video.js";
import type { VideoJsHotkeysOptions } from "videojs-hotkeys";

declare global {
  declare function videojs(
    id: any,
    options?: VideoJsPlayerOptions,
    ready?: () => void
  ): VideoJsPlayer;
}

namespace videojs {
  interface VideoJsPlayer {
    hotkeys(options?: VideoJsHotkeysOptions): void;
  }
}
