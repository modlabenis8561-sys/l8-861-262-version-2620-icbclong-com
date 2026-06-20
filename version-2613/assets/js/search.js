(function () {
    var input = document.querySelector('[data-global-search]');
    var category = document.querySelector('[data-global-category]');
    var results = document.querySelector('[data-search-results]');
    var data = window.SEARCH_MOVIES || [];

    if (!input || !category || !results) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function itemHtml(item) {
        return [
            '<a class="movie-card" href="' + item.url + '" data-filter="' + escapeHtml([item.title, item.region, item.type, item.category, item.tags.join(' ')].join(' ')) + '">',
            '    <div class="movie-thumb">',
            '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '        <span class="corner-label">' + escapeHtml(item.category) + '</span>',
            '        <span class="year-label">' + escapeHtml(item.year) + '年</span>',
            '    </div>',
            '    <div class="movie-card-body">',
            '        <h3>' + escapeHtml(item.title) + '</h3>',
            '        <p>' + escapeHtml(item.summary) + '</p>',
            '        <div class="movie-small-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '    </div>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function render() {
        var keyword = input.value.trim().toLowerCase();
        var categoryName = category.value;
        var matches = data.filter(function (item) {
            var text = [item.title, item.region, item.type, item.category, item.summary, item.tags.join(' ')].join(' ').toLowerCase();
            var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
            var categoryMatch = !categoryName || item.category === categoryName;
            return keywordMatch && categoryMatch;
        }).slice(0, 96);

        if (matches.length === 0) {
            results.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
            return;
        }

        results.innerHTML = matches.map(itemHtml).join('');
    }

    input.addEventListener('input', render);
    category.addEventListener('change', render);
    render();
}());
