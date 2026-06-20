import { H as Hls } from "./player-dru42stk.js";

const configNode = document.getElementById("player-config");
const video = document.getElementById("movie-player");
const shell = document.querySelector(".player-shell");
const button = document.querySelector("[data-play-button]");
let isReady = false;
let hls = null;

function getConfig() {
  if (!configNode) {
    return null;
  }

  try {
    return JSON.parse(configNode.textContent || "{}");
  } catch (error) {
    return null;
  }
}

function prepare() {
  if (isReady || !video) {
    return;
  }

  const config = getConfig();

  if (!config || !config.src) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = config.src;
  } else if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(config.src);
    hls.attachMedia(video);
  } else {
    video.src = config.src;
  }

  isReady = true;
}

async function startPlayback() {
  prepare();

  if (shell) {
    shell.classList.add("is-playing");
  }

  if (video) {
    try {
      await video.play();
    } catch (error) {
      if (shell) {
        shell.classList.remove("is-playing");
      }
    }
  }
}

if (button) {
  button.addEventListener("click", startPlayback);
}

if (video) {
  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("is-playing");
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
}

window.addEventListener("pagehide", function () {
  if (hls) {
    hls.destroy();
    hls = null;
  }
});
