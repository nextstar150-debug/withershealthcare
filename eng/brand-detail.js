/**
 * brand-detail.js
 * Brand detail pages (브랜드소개 상세 페이지) 공통 상호작용:
 * - 브랜드소개(GNB) is-active 자동 활성화
 *
 * 주의: DOM 조작 시 null check 필수.
 */
(function () {
  'use strict';

  function normalizePath(pathname) {
    if (!pathname) return '';
    return String(pathname).replace(/\\/g, '/').split('#')[0].split('?')[0];
  }

  function getCurrentFile() {
    var pathname = normalizePath(window.location.pathname);
    if (!pathname) return '';
    var file = pathname.split('/').pop() || '';
    return file;
  }

  // brand-detail-*.html 인 경우 브랜드소개 메뉴를 활성화
  function activateBrandGnbForDetailPages() {
    var currentFile = getCurrentFile();
    if (!currentFile) return;

    if (currentFile.indexOf('brand-detail-') !== 0) return;

    var navLinks = document.querySelectorAll('.nav-links a[href], .drawer a[href]');
    if (!navLinks || navLinks.length === 0) return;

    navLinks.forEach(function (link) {
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;

      var cleanHref = normalizePath(href);

      // 절대 URL/전화번호/메일 등은 제외
      if (cleanHref.indexOf('http') === 0 || cleanHref.indexOf('mailto:') === 0 || cleanHref.indexOf('tel:') === 0) {
        return;
      }

      if (cleanHref === '#' || cleanHref === '') return;

      var hrefFile = cleanHref.replace(/^\.\//, '').split('/').pop();
      if (!hrefFile) return;

      if (hrefFile === 'brand.html') {
        link.classList.add('is-active');

        // 서브메뉴 링크면 부모 메뉴도 함께 활성화
        var parentNavItem = link.closest('.nav-item--has-sub');
        if (parentNavItem) {
          var parentLink = parentNavItem.querySelector('.nav-link');
          if (parentLink) parentLink.classList.add('is-active');
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', activateBrandGnbForDetailPages);
})();

