(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;
        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        prev && prev.addEventListener("click", function () {
            activate(index - 1);
            start();
        });
        next && next.addEventListener("click", function () {
            activate(index + 1);
            start();
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        activate(0);
        start();
    }

    function getUnique(cards, attribute) {
        var values = [];
        cards.forEach(function (card) {
            var value = (card.getAttribute(attribute) || "").trim();
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return b.localeCompare(a, "zh-Hans-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!panel || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var input = panel.querySelector("[data-filter-input]");
        var region = panel.querySelector("[data-filter-region]");
        var year = panel.querySelector("[data-filter-year]");
        var genre = panel.querySelector("[data-filter-genre]");
        var empty = document.querySelector("[data-empty-state]");
        fillSelect(region, getUnique(cards, "data-region"));
        fillSelect(year, getUnique(cards, "data-year"));
        fillSelect(genre, getUnique(cards, "data-genre"));
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var selectedRegion = region ? region.value : "";
            var selectedYear = year ? year.value : "";
            var selectedGenre = genre ? genre.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" ").toLowerCase();
                var pass = true;
                if (query && text.indexOf(query) === -1) {
                    pass = false;
                }
                if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                    pass = false;
                }
                if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                    pass = false;
                }
                if (selectedGenre && card.getAttribute("data-genre") !== selectedGenre) {
                    pass = false;
                }
                card.style.display = pass ? "" : "none";
                if (pass) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [input, region, year, genre].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener("input", apply);
            element.addEventListener("change", apply);
        });
    }

    function createSearchCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        var poster = document.createElement("a");
        poster.className = "poster-frame";
        poster.href = movie.link;
        var image = document.createElement("img");
        image.src = movie.cover;
        image.alt = movie.title;
        image.loading = "lazy";
        var shade = document.createElement("span");
        shade.className = "poster-shade";
        poster.appendChild(image);
        poster.appendChild(shade);
        var body = document.createElement("div");
        body.className = "movie-card-body";
        var meta = document.createElement("div");
        meta.className = "movie-meta";
        [movie.year, movie.region, movie.type].forEach(function (value) {
            var span = document.createElement("span");
            span.textContent = value || "精选";
            meta.appendChild(span);
        });
        var title = document.createElement("h3");
        var titleLink = document.createElement("a");
        titleLink.href = movie.link;
        titleLink.textContent = movie.title;
        title.appendChild(titleLink);
        var text = document.createElement("p");
        text.textContent = movie.oneLine || movie.genre || "精选影片";
        var tags = document.createElement("div");
        tags.className = "tag-list";
        (movie.tags || []).slice(0, 4).forEach(function (tag) {
            var tagSpan = document.createElement("span");
            tagSpan.textContent = tag;
            tags.appendChild(tagSpan);
        });
        body.appendChild(meta);
        body.appendChild(title);
        body.appendChild(text);
        body.appendChild(tags);
        article.appendChild(poster);
        article.appendChild(body);
        return article;
    }

    function setupSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = page.querySelector("[data-search-input]");
        var results = page.querySelector("[data-search-results]");
        var empty = page.querySelector("[data-search-empty]");
        var title = page.querySelector("[data-search-title]");
        if (input) {
            input.value = query;
        }
        function render(value) {
            var term = value.trim().toLowerCase();
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                if (!term) {
                    return true;
                }
                return [movie.title, movie.region, movie.year, movie.genre, movie.type, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(term) !== -1;
            }).slice(0, 240);
            results.innerHTML = "";
            matched.forEach(function (movie) {
                results.appendChild(createSearchCard(movie));
            });
            if (empty) {
                empty.classList.toggle("is-visible", matched.length === 0);
            }
            if (title) {
                title.textContent = term ? "搜索结果" : "精选结果";
            }
        }
        render(query);
        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (video) {
            var wrap = video.closest(".player-wrap");
            var overlay = wrap ? wrap.querySelector("[data-player-overlay]") : null;
            var playback = video.getAttribute("data-playback");
            var started = false;
            function launch() {
                if (!playback) {
                    return;
                }
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.setAttribute("controls", "controls");
                if (!started) {
                    started = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = playback;
                        video.play().catch(function () {});
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(playback);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                        video.hlsInstance = hls;
                    } else {
                        video.src = playback;
                        video.play().catch(function () {});
                    }
                } else {
                    video.play().catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener("click", launch);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    launch();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
