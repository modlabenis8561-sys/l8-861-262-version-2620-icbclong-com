(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  const backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("visible", window.scrollY > 420);
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    function showSlide(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        showSlide(current);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide((index + 1) % slides.length);
      }, 5200);
    }
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const filterItems = Array.from(
    document.querySelectorAll("[data-filter-item]"),
  );
  const filterCount = document.querySelector("[data-filter-count]");

  if (filterInput && filterItems.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query) {
      filterInput.value = query;
    }

    function applyFilter() {
      const value = filterInput.value.trim().toLowerCase();
      let visible = 0;

      filterItems.forEach(function (item) {
        const haystack = (
          item.getAttribute("data-search") ||
          item.textContent ||
          ""
        ).toLowerCase();
        const matched = !value || haystack.indexOf(value) !== -1;
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = value ? "已匹配 " + visible + " 项" : "";
      }
    }

    filterInput.addEventListener("input", applyFilter);
    applyFilter();
  }
})();
