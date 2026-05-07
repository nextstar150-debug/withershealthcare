/* ===========================================
   WITHUS HEALTHCARE — history.js
   Company History (회사소개 > 연혁) page interactions
   =========================================== */
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

        /* Activate parent nav item too */
        var parentNavItem = link.closest('.nav-item--has-sub');
        if (parentNavItem) {
          var parentLink = parentNavItem.querySelector(':scope > .nav-link');
          if (parentLink) parentLink.classList.add('is-active');
        }
      }
    });
  }

  /* ============================================================
     Sub-navigation tabs — auto-activate current page tab
  ============================================================ */
  function activateSubnav() {
    var currentPath = getCurrentPagePath();
    var tabLinks = document.querySelectorAll('.pg-subnav__item');
    if (!tabLinks || tabLinks.length === 0) return;

    tabLinks.forEach(function (link) {
      if (!link) return;
      var linkPath = getLinkPathname(link.getAttribute('href'));
      if (!linkPath) return;

      if (linkPath === currentPath) {
        link.classList.add('is-active');
      }
    });
  }

  /* ============================================================
     Scroll-to-top button
  ============================================================ */
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     Scroll Reveal — IntersectionObserver for timeline elements
  ============================================================ */
  var revealEls = document.querySelectorAll(
    '.hist-intro, .hist-photo-wrap, .hist-group'
  );

  if ('IntersectionObserver' in window && revealEls.length > 0) {
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
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* ============================================================
     타임라인 dot 활성화
     각 .hist-group이 뷰포트에 진입하면 → .hist-dot에 .is-active 부여
     회색 작은 점 → 파란 동심원(31px 바깥 + 13px 안쪽)으로 전환
  ============================================================ */
  var histGroups = document.querySelectorAll('.hist-group');

  if ('IntersectionObserver' in window && histGroups.length > 0) {
    var dotObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var dot = entry.target.querySelector('.hist-dot');
        if (dot) dot.classList.add('is-active');
        dotObserver.unobserve(entry.target);
      });
    }, { threshold: 0.20, rootMargin: '0px 0px -60px 0px' });

    histGroups.forEach(function (group) {
      dotObserver.observe(group);
    });
  } else {
    /* Fallback: IntersectionObserver 미지원 브라우저 */
    histGroups.forEach(function (group) {
      var dot = group.querySelector('.hist-dot');
      if (dot) dot.classList.add('is-active');
    });
  }

  /* ============================================================
     Initialise on DOM ready
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    activateGnb();
    activateSubnav();
  });

})();
