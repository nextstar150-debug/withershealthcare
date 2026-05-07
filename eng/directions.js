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

  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var revealEls = document.querySelectorAll('.dir-reveal');

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

  /* ============================================================
     Initialise on DOM ready
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    activateGnb();
    activateSubnav();
  });

}());
