(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slider = document.querySelector(".js-hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var q = new URLSearchParams(window.location.search).get("q") || "";
        var areas = Array.prototype.slice.call(document.querySelectorAll(".js-filter-area"));
        areas.forEach(function (area) {
            var input = area.querySelector(".js-filter-input");
            var root = area.parentElement || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll(".js-movie-card"));
            var empty = area.querySelector(".js-empty-state");
            var selects = Array.prototype.slice.call(area.querySelectorAll(".js-filter-select"));
            if (input && q) {
                input.value = q;
            }

            function run() {
                var text = normalize(input ? input.value : "");
                var values = {};
                selects.forEach(function (select) {
                    values[select.name] = normalize(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var content = normalize(card.getAttribute("data-search") || card.textContent);
                    var matchText = !text || content.indexOf(text) !== -1;
                    var matchCategory = !values.category || normalize(card.getAttribute("data-category")) === values.category;
                    var matchYear = !values.year || normalize(card.getAttribute("data-year")) === values.year;
                    var matchType = !values.type || normalize(card.getAttribute("data-type")) === values.type;
                    var match = matchText && matchCategory && matchYear && matchType;
                    card.classList.toggle("is-hidden", !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", run);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", run);
            });
            run();
        });
    }

    function initImages() {
        Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            });
        });
    }

    function initPlayer() {
        var box = document.querySelector(".js-player");
        if (!box) {
            return;
        }
        var video = box.querySelector("video");
        var cover = box.querySelector(".js-player-start");
        if (!video || !cover) {
            return;
        }
        var stream = video.getAttribute("data-stream-url");
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }
            video.src = stream;
        }

        function play() {
            cover.classList.add("is-hidden");
            video.controls = true;
            prepare();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    video.controls = true;
                });
            }
        }

        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initImages();
        initPlayer();
    });
}());
