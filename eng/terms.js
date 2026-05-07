/**
 * terms.js
 * - Drawer / language: eng/script.js
 * - Scroll-to-top, header shadow on scroll
 * (Mirrors privacy.js for the Terms of Service page)
 */

(function () {
  'use strict';

  /* 햄버거 / 드로어 / 언어: script.js (중복 바인딩 방지) */

  /* ── Scroll-to-Top Button ───────────────────────────────── */
  var scrollTopBtn   = document.getElementById('scrollTopBtn');
  var SCROLL_SHOW_AT = 300; /* px from top before showing button */

  function onScroll() {
    /* Toggle scroll-to-top visibility */
    if (scrollTopBtn) {
      if (window.scrollY > SCROLL_SHOW_AT) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }

    /* Header shadow on scroll */
    var header = document.getElementById('header');
    if (header) {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 24px rgba(0,0,0,0.10)'
        : '0 2px 24px rgba(0,0,0,0.08)';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
