(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        start();
    }

    function cardText(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function setupFilters() {
        var scope = document.querySelector("[data-filter-scope]");
        if (!scope) {
            return;
        }
        var input = scope.querySelector("[data-filter-input]");
        var region = scope.querySelector("[data-region-filter]");
        var sort = scope.querySelector("[data-sort-select]");
        var grid = scope.querySelector("[data-card-grid]");
        var empty = scope.querySelector("[data-empty-state]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".searchable-card"));
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get("search");
        if (input && keyword) {
            input.value = keyword;
        }
        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "all";
            var visible = 0;
            cards.forEach(function (card) {
                var text = cardText(card);
                var matchesText = !q || text.indexOf(q) !== -1;
                var matchesRegion = regionValue === "all" || (card.getAttribute("data-region") || "").indexOf(regionValue) !== -1;
                var show = matchesText && matchesRegion;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        function applySort() {
            var value = sort ? sort.value : "default";
            var sorted = cards.slice();
            if (value === "year-desc") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
            } else if (value === "year-asc") {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
                });
            } else if (value === "title") {
                sorted.sort(function (a, b) {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
                });
            } else {
                sorted.sort(function (a, b) {
                    return cards.indexOf(a) - cards.indexOf(b);
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            apply();
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (region) {
            region.addEventListener("change", apply);
        }
        if (sort) {
            sort.addEventListener("change", applySort);
        }
        applySort();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
