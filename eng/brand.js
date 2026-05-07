/**
 * brand.js
 * Brand Introduction (브랜드소개) page interactions:
 * - Mobile drawer, language: eng/script.js
 * - Scroll-to-top button visibility
 * - Header shadow on scroll
 * - Scroll-reveal for product cards
 * - Pagination click handling (mock)
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

  /* 햄버거 / 드로어 / 언어: script.js (중복 바인딩 방지) */

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

  /* 초기 상태 동기화 */
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Product cards: show all immediately (no sequential reveal) ── */
  document.querySelectorAll('.brand-card.reveal').forEach(function (el) {
    el.classList.add('in-view');
  });

  /* ── Pagination — mock click behavior ───────────────────── */
  document.querySelectorAll('.pag-page').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.pag-page').forEach(function (b) {
        b.classList.remove('pag-page--active');
        b.removeAttribute('aria-current');
      });
      this.classList.add('pag-page--active');
      this.setAttribute('aria-current', 'page');
      /* Scroll to top of product grid on page change */
      var grid = document.querySelector('.brand-grid');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

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

  /* ============================================================
     Initialise on DOM ready
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    activateGnb();
  });

})();
