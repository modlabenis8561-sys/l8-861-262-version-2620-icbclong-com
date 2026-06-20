(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var filterInput = document.querySelector('[data-page-filter]');
    var grid = document.querySelector('[data-card-grid]');
    var sortSelect = document.querySelector('[data-page-sort]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function getCards() {
        if (!grid) {
            return [];
        }
        return Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    }

    function applyFilter() {
        var keyword = normalize(filterInput ? filterInput.value : '');
        getCards().forEach(function (card) {
            var text = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.year + ' ' + card.dataset.type);
            card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
        });
    }

    function applySort() {
        if (!grid || !sortSelect) {
            return;
        }
        var mode = sortSelect.value;
        var cards = getCards();
        cards.sort(function (a, b) {
            if (mode === 'year-desc') {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }
            if (mode === 'year-asc') {
                return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
            }
            if (mode === 'title') {
                return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
            }
            return 0;
        });
        cards.forEach(function (card) {
            grid.appendChild(card);
        });
        applyFilter();
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }
}());
