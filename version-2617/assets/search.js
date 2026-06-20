(function () {
    var input = document.getElementById('searchInput');
    var category = document.getElementById('searchCategory');
    var type = document.getElementById('searchType');
    var results = document.getElementById('searchResults');
    var status = document.getElementById('searchStatus');
    var data = window.MOVIE_SEARCH_INDEX || [];

    function params() {
        return new URLSearchParams(window.location.search);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<a class="movie-card" href="' + escapeHtml(movie.href) + '">' +
                '<div class="poster-box">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
                '</div>' +
                '<div class="movie-info">' +
                    '<h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                '</div>' +
            '</a>';
    }

    function runSearch() {
        var keyword = normalize(input ? input.value : '');
        var catValue = category ? category.value : '';
        var typeValue = type ? type.value : '';
        var matched = data.filter(function (movie) {
            var text = normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + (movie.tags || []).join(' ') + ' ' + movie.oneLine);
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okCategory = !catValue || movie.category === catValue;
            var okType = !typeValue || String(movie.type || '').indexOf(typeValue) !== -1;
            return okKeyword && okCategory && okType;
        }).slice(0, 120);

        if (!keyword && !catValue && !typeValue) {
            matched = data.slice(0, 48);
        }

        results.innerHTML = matched.map(renderCard).join('');
        status.textContent = matched.length ? '已显示匹配内容，点击卡片进入播放详情页。' : '没有找到匹配内容。';
    }

    var query = params().get('q') || '';
    if (input) {
        input.value = query;
        input.addEventListener('input', runSearch);
    }
    if (category) {
        category.addEventListener('change', runSearch);
    }
    if (type) {
        type.addEventListener('change', runSearch);
    }
    runSearch();
}());
