(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupPlayer(root) {
        var video = root.querySelector("video");
        var overlay = root.querySelector(".player-overlay");
        var source = root.getAttribute("data-src");
        var hls = null;
        var started = false;
        if (!video || !source) {
            return;
        }
        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }
        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        function start() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            hideOverlay();
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                playVideo();
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        video.addEventListener("play", hideOverlay);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(setupPlayer);
    });
}());
