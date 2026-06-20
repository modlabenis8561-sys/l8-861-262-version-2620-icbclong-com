(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
        var prev = hero.querySelector('[data-prev]');
        var next = hero.querySelector('[data-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function reset() {
            window.clearInterval(timer);
            play();
        }

        if (slides.length > 1) {
            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    reset();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    reset();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-slide')) || 0);
                    reset();
                });
            });

            play();
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterInput && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-filter]'));

        function filterCards() {
            var keyword = filterInput.value.trim().toLowerCase();
            var typeValue = typeFilter ? typeFilter.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-filter') || '').toLowerCase();
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var typeMatch = !typeValue || text.indexOf(typeValue) !== -1;
                card.classList.toggle('is-filtered-out', !(keywordMatch && typeMatch));
            });
        }

        filterInput.addEventListener('input', filterCards);

        if (typeFilter) {
            typeFilter.addEventListener('change', filterCards);
        }
    }
}());
