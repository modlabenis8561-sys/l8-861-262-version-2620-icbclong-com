import { H as Hls } from "./hls-vendor.js";

function setupPlayer(container) {
  const video = container.querySelector("video");
  const button = container.querySelector(".player-start");

  if (!video || !button) {
    return;
  }

  const source = video.getAttribute("data-source");
  let isReady = false;
  let hlsInstance = null;

  function attachSource() {
    if (isReady || !source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      isReady = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      isReady = true;
      return;
    }

    video.src = source;
    isReady = true;
  }

  async function startPlayback() {
    attachSource();
    container.classList.add("is-playing");
    button.hidden = true;

    try {
      await video.play();
    } catch (error) {
      button.hidden = false;
      container.classList.remove("is-playing");
    }
  }

  button.addEventListener("click", startPlayback);

  container.addEventListener("click", function (event) {
    if (event.target === video && !isReady) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    container.classList.add("is-playing");
    button.hidden = true;
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0) {
      button.hidden = false;
      container.classList.remove("is-playing");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
