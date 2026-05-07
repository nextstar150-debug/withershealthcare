/* ===========================================
   WITHUS HEALTHCARE — about.js
   Company Overview (회사개요) page interactions
   =========================================== */
(function () {
  'use strict';

  /* ---- GNB 자동 활성화 (가이드: is-active) ---- */
  function normalizePathname(pathname) {
    if (!pathname) return '/';
    return pathname.replace(/\\/g, '/');
  }

  function getCurrentPagePath() {
    var p = normalizePathname(window.location.pathname || '/');
    return p;
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

  function activateGnb() {
    var currentPath = getCurrentPagePath();
    var links = document.querySelectorAll(
      '.nav-link, .nav-submenu a, .drawer__btn--link, .drawer__sub-link'
    );
    if (!links || links.length === 0) return;

    links.forEach(function (link) {
      if (!link) return;
      var href = link.getAttribute('href');
      var linkPath = getLinkPathname(href);
      if (!linkPath) return;

      if (linkPath === currentPath) {
        link.classList.add('is-active');

        /* 서브메뉴/드로어 서브링크면 부모도 활성화 */
        var parentNavItem = link.closest('.nav-item--has-sub');
        if (parentNavItem) {
          var parentLink = parentNavItem.querySelector(':scope > .nav-link');
          if (parentLink) parentLink.classList.add('is-active');
        }
      }
    });
  }

  /* ---- 서브페이지 탭 메뉴 자동 활성화 (about: pg-subnav) ---- */
  function activateCompanyTabs() {
    var currentPath = getCurrentPagePath();
    var tabLinks = document.querySelectorAll('.pg-subnav__item');
    if (!tabLinks || tabLinks.length === 0) return;

    tabLinks.forEach(function (link) {
      if (!link) return;
      var href = link.getAttribute('href');
      var linkPath = getLinkPathname(href);
      if (!linkPath) return;

      if (linkPath === currentPath) {
        link.classList.add('is-active');
      }
    });
  }

  /* ---- Scroll-to-top button ---- */
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    activateGnb();
    activateCompanyTabs();
  });

  /* ---- Scroll Reveal — shared .reveal class from style.css ---- */
  var revealEls = document.querySelectorAll('.ao-vision, .ao-mission, .ao-value-item, .ao-glance__content');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---- Animated number counter for At a Glance section ---- */
  function animateNumber(el, start, end, duration, suffix) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      /* ease-out curve */
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(start + eased * (end - start)) + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var glanceSection = document.querySelector('.ao-glance');
  var counted = false;

  if (glanceSection && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        /* Animate the "50" in거래처 */
        var bigEl = document.querySelector('.ao-stat__big');
        if (bigEl) animateNumber(bigEl, 0, 50, 1200, '');
      }
    }, { threshold: 0.4 });
    countObserver.observe(glanceSection);
  }

})();
