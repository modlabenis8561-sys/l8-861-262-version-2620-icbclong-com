import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupMobileNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function setupHeroCarousel() {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length <= 1) {
    return;
  }

  let currentIndex = 0;

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => showSlide(dotIndex));
  });

  window.setInterval(() => showSlide(currentIndex + 1), 5200);
}

function setupFilters() {
  const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach((panel) => {
    const grid = document.querySelector(panel.getAttribute("data-target") || "[data-movie-grid]");
    const cards = grid ? Array.from(grid.querySelectorAll("[data-movie-card]")) : [];
    const empty = document.querySelector(panel.getAttribute("data-empty") || "[data-empty-state]");
    const count = document.querySelector(panel.getAttribute("data-count") || "[data-result-count]");
    const search = panel.querySelector("[data-filter-search]");
    const category = panel.querySelector("[data-filter-category]");
    const region = panel.querySelector("[data-filter-region]");
    const type = panel.querySelector("[data-filter-type]");
    const year = panel.querySelector("[data-filter-year]");
    const sort = panel.querySelector("[data-filter-sort]");

    if (!grid || cards.length === 0) {
      return;
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();

    const matchesSelect = (card, key, value) => {
      if (!value || value === "all") {
        return true;
      }

      return normalize(card.dataset[key]) === normalize(value);
    };

    const apply = () => {
      const keyword = normalize(search ? search.value : "");
      const selectedCategory = category ? category.value : "all";
      const selectedRegion = region ? region.value : "all";
      const selectedType = type ? type.value : "all";
      const selectedYear = year ? year.value : "all";
      const sortBy = sort ? sort.value : "index";

      let visibleCards = cards.filter((card) => {
        const searchable = normalize(card.dataset.search || card.textContent);
        return (
          (!keyword || searchable.includes(keyword)) &&
          matchesSelect(card, "category", selectedCategory) &&
          matchesSelect(card, "region", selectedRegion) &&
          matchesSelect(card, "type", selectedType) &&
          matchesSelect(card, "year", selectedYear)
        );
      });

      visibleCards.sort((a, b) => {
        if (sortBy === "score") {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        }

        if (sortBy === "year") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }

        return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
      });

      cards.forEach((card) => {
        card.hidden = true;
      });

      visibleCards.forEach((card) => {
        card.hidden = false;
        grid.appendChild(card);
      });

      if (count) {
        count.textContent = String(visibleCards.length);
      }

      if (empty) {
        empty.classList.toggle("is-visible", visibleCards.length === 0);
      }
    };

    [search, category, region, type, year, sort].forEach((control) => {
      if (!control) {
        return;
      }

      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply);
    });

    apply();
  });
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach((player) => {
    const video = player.querySelector("video");
    const overlay = player.querySelector("[data-player-overlay]");
    const status = player.querySelector("[data-player-status]");
    const source = player.getAttribute("data-source");

    if (!video || !source) {
      return;
    }

    let hlsInstance = null;
    let initialized = false;

    const setStatus = (message) => {
      if (status) {
        status.textContent = message;
      }
    };

    const initialize = () => {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setStatus("正在连接播放线路...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("播放线路就绪。");
        return Promise.resolve();
      }

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus("播放线路就绪。");
        });

        hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            setStatus("播放线路加载失败，请稍后重试。");
          }
        });

        return Promise.resolve();
      }

      video.src = source;
      setStatus("当前浏览器播放能力受限，将尝试直接播放。");
      return Promise.resolve();
    };

    const play = () => {
      initialize()
        .then(() => video.play())
        .then(() => {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          setStatus("");
        })
        .catch(() => {
          setStatus("播放被浏览器拦截，请再次点击播放按钮。");
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("play", () => {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", () => {
      if (overlay && !video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();
  setupHeroCarousel();
  setupFilters();
  setupPlayers();
});
