(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-stream") || "";
    var prepared = false;
    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    function begin() {
      prepare();
      shell.classList.add("is-playing");
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }
    button.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });
    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
    });
  }

  onReady(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]")).forEach(setupPlayer);
  });
})();
