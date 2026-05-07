/**
 * brand.js
 * Brand Introduction (브랜드소개) page interactions:
 * - GNB 활성 표시 · aria 동기화 (글로벌 동작은 script.js)
 * - Scroll-to-top, header 그림자, 상단 배너, 카드 노출·페이지네이션
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

  /*
   * 햄버거 / 드로어 / 드로어 내 서브 아코디언:
   * script.js 에서 단일 처리 (중복 바인딩 시 첫 번째 핸들러가 연 뒤
   * 두 번째가 is-open 제거 → 서브메뉴가 열리지 않는 버그 발생)
   */

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
     Floating banner (guide) — scroll to toggle visibility
  ============================================================ */
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
