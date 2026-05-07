/**
 * privacy.js
 * Handles: nav hamburger/drawer, language dropdown,
 *          scroll-to-top button, header shadow on scroll
 */

(function () {
  'use strict';

  /* ── Hamburger / Mobile Drawer ──────────────────────────── */
  var hamburger   = document.getElementById('navHamburger');
  var drawer      = document.getElementById('navDrawer');
  var drawerClose = document.getElementById('drawerClose');
  var overlay     = document.getElementById('drawerOverlay');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger)   hamburger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay)     overlay.addEventListener('click', closeDrawer);

  /* Drawer accordion sub-menus */
  document.querySelectorAll('.drawer__btn[aria-controls]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      var subId    = this.getAttribute('aria-controls');
      var sub      = document.getElementById(subId);
      this.setAttribute('aria-expanded', String(!expanded));
      if (sub) sub.classList.toggle('is-open', !expanded);
    });
  });

  /* Close drawer on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* 언어 드롭다운: script.js 에서 처리 (중복 바인딩 방지) */

  /* ── Scroll-to-Top Button ───────────────────────────────── */
  var scrollTopBtn    = document.getElementById('scrollTopBtn');
  var SCROLL_SHOW_AT  = 300; /* px from top before showing button */

  function onScroll() {
    /* Toggle scroll-to-top visibility */
    if (scrollTopBtn) {
      if (window.scrollY > SCROLL_SHOW_AT) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }

    /* Header shadow */
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
