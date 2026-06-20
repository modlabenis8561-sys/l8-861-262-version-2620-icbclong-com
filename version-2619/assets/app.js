(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mainNav = document.querySelector('.main-nav');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            var opened = mainNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;
        var activate = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                activate(current + 1);
            }, 5200);
        }
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    filterPanels.forEach(function (panel) {
        var input = panel.querySelector('.js-search');
        var chips = Array.prototype.slice.call(panel.querySelectorAll('.filter-chip'));
        var sort = panel.querySelector('.js-sort');
        var scope = panel.parentElement;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var activeFilter = 'all';

        var normalize = function (value) {
            return (value || '').toString().toLowerCase().trim();
        };

        var apply = function () {
            var query = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchChip = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
                card.classList.toggle('is-filtered-out', !(matchQuery && matchChip));
            });
        };

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                apply();
            });
        });

        if (sort) {
            sort.addEventListener('change', function () {
                var grid = cards[0] ? cards[0].parentElement : null;
                if (!grid) {
                    return;
                }
                var sorted = cards.slice();
                var value = sort.value;
                sorted.sort(function (a, b) {
                    if (value === 'year-desc') {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }
                    if (value === 'year-asc') {
                        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                    }
                    if (value === 'name') {
                        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                    }
                    return 0;
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                cards = sorted;
                apply();
            });
        }

        apply();
    });

    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    var hlsInstance = null;
    var playerReady = false;

    var preparePlayer = function () {
        if (!video || playerReady) {
            return;
        }
        var src = video.getAttribute('data-src');
        if (!src) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            playerReady = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            playerReady = true;
            return;
        }
        video.src = src;
        playerReady = true;
    };

    var playVideo = function () {
        if (!video) {
            return;
        }
        preparePlayer();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    };

    if (video) {
        preparePlayer();
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-play-target]')).forEach(function (button) {
        button.addEventListener('click', playVideo);
    });

    var backTop = document.querySelector('.back-top');
    if (backTop) {
        var toggleBackTop = function () {
            backTop.classList.toggle('visible', window.scrollY > 420);
        };
        window.addEventListener('scroll', toggleBackTop, { passive: true });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        toggleBackTop();
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
