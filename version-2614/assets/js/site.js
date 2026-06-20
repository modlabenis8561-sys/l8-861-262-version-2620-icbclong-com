(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function update() {
      if (window.scrollY > 360) {
        button.classList.add("show");
      } else {
        button.classList.remove("show");
      }
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    var empty = document.querySelector("[data-empty-state]");
    function apply() {
      var query = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-cover" href="' + item.link + '">',
      '    <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
      '    <span class="cover-play">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta">',
      '      <span>' + item.year + '</span>',
      '      <span>' + item.region + '</span>',
      '      <span>' + item.type + '</span>',
      '    </div>',
      '    <h2><a href="' + item.link + '">' + item.title + '</a></h2>',
      '    <p>' + item.line + '</p>',
      '    <div class="tag-row"><span>' + item.genre + '</span></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-empty-state]");
    if (!form || !input || !results || !window.MovieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var query = normalize(input.value);
      var list = window.MovieSearchIndex.filter(function (item) {
        var text = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.line].join(" "));
        return !query || text.indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(cardTemplate).join("");
      if (empty) {
        empty.classList.toggle("show", list.length === 0);
      }
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set("q", input.value.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  onReady(function () {
    setupNavigation();
    setupBackTop();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
