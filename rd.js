/**
 * rd.js
 * 연구개발 (R&D) page interactions:
 * - Mobile drawer: script.js
 * - Language dropdown: script.js
 * - Scroll-to-top button visibility
 * - Header shadow on scroll
 * - Scroll-reveal for cards and goal section
 * - GNB active state
 * - Floating banner visibility
 */

(function () {
  'use strict';

  /* ============================================================
     Utility: normalise URL pathname for cross-OS comparison
  ============================================================ */
  function normalizePathname(pathname) {
    if (!pathname) return '/';
    return pathname.replace(/\\/g, '/');
  }

  function getCurrentPagePath() {
    return normalizePathname(window.location.pathname || '/');
  }

  function getLinkPathname(href) {
    if (!href || href === '#') return null;
    try {
      var u = new URL(href, window.location.href);
      return normalizePathname(u.pathname);
    } catch (e) {
      return null;
    }
  }

  /* ============================================================
     GNB — auto-activate current page link
  ============================================================ */
  function activateGnb() {
    var currentPath = getCurrentPagePath();
    var links = document.querySelectorAll(
      '.nav-link, .nav-submenu a, .drawer__btn--link, .drawer__sub-link'
    );
    if (!links || links.length === 0) return;

    links.forEach(function (link) {
      if (!link) return;
      var linkPath = getLinkPathname(link.getAttribute('href'));
      if (!linkPath) return;

      if (linkPath === currentPath) {
        link.classList.add('is-active');

        /* 서브메뉴인 경우 부모 GNB도 활성화 */
        var parentNavItem = link.closest('.nav-item--has-sub');
        if (parentNavItem) {
          var parentLink = parentNavItem.querySelector(':scope > .nav-link');
          if (parentLink) parentLink.classList.add('is-active');
        }
      }
    });
  }

  /* 햄버거 / 드로어 / 언어 드롭다운: script.js (중복 바인딩 방지) */

  /* ── Scroll handler: header shadow + scroll-to-top ─────── */
  var scrollTopBtn   = document.getElementById('scrollTopBtn');
  var headerEl       = document.getElementById('header');
  var SCROLL_SHOW_AT = 300;

  function onScroll() {
    /* Scroll-to-top button */
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('is-visible', window.scrollY > SCROLL_SHOW_AT);
    }
    /* Header shadow */
    if (headerEl) {
      headerEl.style.boxShadow = window.scrollY > 10
        ? '0 2px 24px rgba(0,0,0,0.12)'
        : '0 2px 24px rgba(0,0,0,0.08)';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* sync initial state */

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Scroll Reveal — cards, intro, goal ─────────────────── */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    /* Fallback: show all immediately */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* ── GNB sub-menu accessibility (aria-expanded sync) ───── */
  var navItems = document.querySelectorAll('.nav-item--has-sub');
  navItems.forEach(function (item) {
    var link = item.querySelector('.nav-link');
    if (!link) return;
    item.addEventListener('mouseenter', function () {
      link.setAttribute('aria-expanded', 'true');
    });
    item.addEventListener('mouseleave', function () {
      link.setAttribute('aria-expanded', 'false');
    });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) {
        link.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ── Floating banner — scroll to toggle visibility ──────── */
  var floatingBanner = document.querySelector('.floating-banner');
  function updateFloatingBanner() {
    if (!floatingBanner) return;
    if (window.scrollY > 300) {
      floatingBanner.classList.add('is-visible');
    } else {
      floatingBanner.classList.remove('is-visible');
    }
  }
  if (floatingBanner) {
    window.addEventListener('scroll', updateFloatingBanner, { passive: true });
    updateFloatingBanner();
  }

  /* ============================================================
     Initialise on DOM ready
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    activateGnb();
  });

})();
