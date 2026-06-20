import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(video) {
    var src = video.getAttribute('data-hls');
    var shell = video.closest('.video-shell');
    var button = shell ? shell.querySelector('.play-overlay') : null;

    if (src) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
        }
    }

    function playVideo() {
        if (button) {
            button.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (button) {
                    button.classList.remove('hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
            button.classList.remove('hidden');
        }
    });
}

document.querySelectorAll('video[data-hls]').forEach(setupPlayer);
