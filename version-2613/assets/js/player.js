(function () {
    function setupStream(video, streamUrl) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    window.MoviePlayer = {
        init: function (streamUrl) {
            var video = document.getElementById('movie-video');
            var button = document.getElementById('movie-play-button');

            if (!video || !button || !streamUrl) {
                return;
            }

            setupStream(video, streamUrl);

            function start() {
                button.classList.add('is-hidden');
                var action = video.play();

                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            }

            button.addEventListener('click', start);
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }
    };
}());
