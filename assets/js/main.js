(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var body = document.body;
  var WA = body.getAttribute("data-wa") || "";
  var BRAND = "Off Day Tours";

  function waLink(message) {
    return "https://wa.me/" + WA + (message ? "?text=" + encodeURIComponent(message) : "");
  }

  // WhatsApp links with prefilled messages
  document.querySelectorAll("[data-wa-msg]").forEach(function (el) {
    el.setAttribute("href", waLink(el.getAttribute("data-wa-msg")));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  // Hero image settle
  window.requestAnimationFrame(function () { body.classList.add("is-loaded"); });

  // Hero parallax: image drifts slower than the page, copy fades as it leaves
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heroMedia = document.querySelector(".hero-media");
  var heroImg = heroMedia && heroMedia.querySelector("img");
  var heroCopy = heroMedia && heroMedia.querySelector(".hero-content");
  var ticking = false;
  function paintHero() {
    ticking = false;
    var h = heroMedia.offsetHeight;
    var y = Math.min(Math.max(window.scrollY, 0), h);
    if (heroImg) heroImg.style.setProperty("--hero-shift", (y * 0.12).toFixed(1) + "px");
    if (heroCopy) {
      heroCopy.style.setProperty("--hero-fade", Math.max(0, 1 - y / (h * 0.75)).toFixed(3));
      heroCopy.style.setProperty("--hero-lift", (y * -0.08).toFixed(1) + "px");
    }
  }
  if (heroMedia && !reduceMotion) {
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(paintHero); }
    }, { passive: true });
    paintHero();
  }

  // Header border on scroll
  var header = document.querySelector(".site-header");
  var waFloat = document.querySelector(".wa-float");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (waFloat) waFloat.classList.toggle("is-visible", y > 420);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  function setNav(open) {
    body.classList.toggle("nav-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }
  if (toggle) {
    toggle.addEventListener("click", function () { setNav(!body.classList.contains("nav-open")); });
    document.querySelectorAll(".mobile-nav a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1080) setNav(false); });
  }

  // Reveal on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Tour filters
  var filterBtns = document.querySelectorAll(".filter-btn");
  var tours = document.querySelectorAll(".tour[data-cat]");
  var grid = document.getElementById("tour-grid");
  var moreBtn = document.getElementById("tour-more");
  var expanded = false;
  var firstRun = true;
  function applyFilter(cat) {
    var shown = 0;
    var collapsed = cat === "all" && !expanded;
    var wasCollapsed = grid && grid.classList.contains("is-collapsed");
    var popped = 0;
    tours.forEach(function (t) {
      var match = cat === "all" || t.getAttribute("data-cat") === cat;
      var wasVisible = !t.hidden && !(wasCollapsed && t.classList.contains("is-extra"));
      t.hidden = !match;
      t.classList.remove("is-pop");
      if (match) {
        shown++;
        t.classList.add("is-in");
        if (!firstRun && !wasVisible && !(collapsed && t.classList.contains("is-extra"))) {
          t.style.setProperty("--n", String(popped++));
          void t.offsetWidth;
          t.classList.add("is-pop");
        }
      }
    });
    firstRun = false;
    filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === cat ? "true" : "false"); });
    if (grid) grid.classList.toggle("is-collapsed", cat === "all" && !expanded);
    if (moreBtn) moreBtn.parentNode.hidden = cat !== "all" || expanded;
    var live = document.getElementById("tour-count");
    if (live) live.textContent = shown + (shown === 1 ? " experience" : " experiences");
  }
  if (filterBtns.length) {
    filterBtns.forEach(function (b) {
      b.addEventListener("click", function () { applyFilter(b.getAttribute("data-filter")); });
    });
    if (moreBtn) {
      moreBtn.addEventListener("click", function () {
        expanded = true;
        moreBtn.setAttribute("aria-expanded", "true");
        applyFilter("all");
      });
    }
    document.querySelectorAll("[data-filter-link]").forEach(function (a) {
      a.addEventListener("click", function () { applyFilter(a.getAttribute("data-filter-link")); });
    });
    applyFilter("all");
  }

  // Highlight the current section in the menu
  var navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-active"); });
        var link = map[entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).concat(["top"]).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
