(function () {
  const toggle = document.querySelector(".mobile-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      const isOpen = panel.hasAttribute("hidden");
      panel.toggleAttribute("hidden", !isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "×" : "☰";
    });
  }

  const carousel = document.querySelector("[data-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const next = carousel.querySelector("[data-next]");
    const prev = carousel.querySelector("[data-prev]");
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.slide || 0));
        restart();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    show(0);
    start();
  }

  const localInput = document.querySelector(".local-search-input");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter-value]"));
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  let typeValue = "";

  const normalize = function (value) {
    return String(value || "").toLowerCase().trim();
  };

  const applyLocalFilter = function () {
    const keyword = normalize(localInput ? localInput.value : "");
    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre
      ].join(" "));
      const matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchesType = !typeValue || haystack.indexOf(normalize(typeValue)) !== -1;
      card.classList.toggle("is-hidden", !(matchesKeyword && matchesType));
    });
  };

  if (localInput) {
    localInput.addEventListener("input", applyLocalFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
      typeValue = button.dataset.filterValue || "";
      applyLocalFilter();
    });
  });

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const searchInput = document.getElementById("search-page-input");
  const results = document.getElementById("search-results");
  const summary = document.getElementById("search-summary");

  if (searchInput) {
    searchInput.value = q;
  }

  if (results && summary && Array.isArray(window.SEARCH_MOVIES)) {
    const keyword = normalize(q);
    if (!keyword) {
      results.innerHTML = "";
      summary.textContent = "请输入关键词开始搜索。";
      return;
    }

    const matched = window.SEARCH_MOVIES.filter(function (movie) {
      return normalize([
        movie.title,
        movie.description,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags
      ].join(" ")).indexOf(keyword) !== -1;
    }).slice(0, 120);

    summary.textContent = "关键词 “" + q + "” 找到 " + matched.length + " 条相关结果";
    results.innerHTML = matched.map(function (movie) {
      const tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"movie-cover\" href=\"" + escapeHtml(movie.url) + "\">" +
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"movie-category\">" + escapeHtml(movie.category) + "</span>" +
        "<span class=\"movie-score\">" + escapeHtml(movie.score) + "</span>" +
        "</a>" +
        "<div class=\"movie-info\">" +
        "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p>" + escapeHtml(movie.description) + "</p>" +
        "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
