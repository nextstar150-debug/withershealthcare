/**
 * contact.js
 * 상담문의 (Contact Us) page interactions:
 * - Mobile drawer, language: eng/script.js
 * - Scroll-to-top button visibility
 * - Header shadow on scroll
 * - Scroll-reveal animations
 * - Custom checkbox toggle
 * - Form validation
 * - Phone input: digits only + auto-tab
 */

(function () {
  'use strict';

  /* ============================================================
     Utility: normalise URL pathname
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
    } catch (e) { return null; }
  }

  /* ============================================================
     GNB — auto-activate current page link
  ============================================================ */
  function activateGnb() {
    var currentPath = getCurrentPagePath();
    var links = document.querySelectorAll(
      '.nav-link, .nav-submenu a, .drawer__btn--link, .drawer__sub-link'
    );
    links.forEach(function (link) {
      if (!link) return;
      var linkPath = getLinkPathname(link.getAttribute('href'));
      if (!linkPath) return;
      if (linkPath === currentPath) {
        link.classList.add('is-active');
        var parentNavItem = link.closest('.nav-item--has-sub');
        if (parentNavItem) {
          var parentLink = parentNavItem.querySelector(':scope > .nav-link');
          if (parentLink) parentLink.classList.add('is-active');
        }
      }
    });
  }

  /* 햄버거 / 드로어 / 언어: script.js (중복 바인딩 방지) */

  /* ============================================================
     Scroll — header shadow + scroll-to-top
  ============================================================ */
  var scrollTopBtn   = document.getElementById('scrollTopBtn');
  var headerEl       = document.getElementById('header');
  var SCROLL_SHOW_AT = 300;

  function onScroll() {
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('is-visible', window.scrollY > SCROLL_SHOW_AT);
    }
    if (headerEl) {
      headerEl.style.boxShadow = window.scrollY > 10
        ? '0 2px 24px rgba(0,0,0,0.12)'
        : '0 2px 24px rgba(0,0,0,0.08)';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     GNB sub-menu accessibility
  ============================================================ */
  document.querySelectorAll('.nav-item--has-sub').forEach(function (item) {
    var link = item.querySelector('.nav-link');
    if (!link) return;
    item.addEventListener('mouseenter', function () { link.setAttribute('aria-expanded', 'true'); });
    item.addEventListener('mouseleave', function () { link.setAttribute('aria-expanded', 'false'); });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) link.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================================
     Scroll Reveal (Intersection Observer)
  ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ============================================================
     Custom Checkbox Toggle
  ============================================================ */
  var checkboxInput  = document.getElementById('consentCheck');
  var checkboxCustom = document.querySelector('.cform-checkbox-custom');

  if (checkboxInput && checkboxCustom) {
    checkboxInput.addEventListener('change', function () {
      checkboxCustom.classList.toggle('is-checked', this.checked);
      var consentRow = document.getElementById('consentRow');
      if (consentRow) consentRow.classList.remove('has-error');
    });
  }

  /* ============================================================
     Phone Input — digits, spaces, hyphens only
  ============================================================ */
  var telNumber = document.getElementById('fieldTelNumber');
  if (telNumber) {
    telNumber.addEventListener('input', function () {
      this.value = this.value.replace(/[^\d\s\-]/g, '');
    });
  }

  /* ============================================================
     Form Validation
  ============================================================ */
  var form = document.getElementById('contactForm');

  function validateField(field) {
    var row = field.closest('.cform-row');
    var ok;

    if (field.type === 'checkbox') {
      ok = field.checked;
      var consentRow = document.getElementById('consentRow');
      if (consentRow) consentRow.classList.toggle('has-error', !ok);
      return ok;
    }

    if (field.required) {
      ok = field.value.trim().length > 0;
    } else {
      ok = true;
    }

    if (row) row.classList.toggle('has-error', !ok);
    return ok;
  }

  function validateAll() {
    var allOk = true;

    /* Required text inputs / textarea */
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (field) {
      if (!validateField(field)) allOk = false;
    });

    return allOk;
  }

  if (form) {
    /* Live clear error on input */
    form.addEventListener('input', function (e) {
      var field = e.target;
      if (field.required && field.value.trim().length > 0) {
        var row = field.closest('.cform-row');
        if (row) row.classList.remove('has-error');
      }
    });

    /* Submit */
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var valid = validateAll();

      if (!valid) {
        var firstError = form.querySelector('.cform-row.has-error, .cform-consent.has-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      var btn = form.querySelector('.contact-submit');
      if (btn) { btn.textContent = '전송 중...'; btn.disabled = true; }

      /* 분리된 필드 합치기 */
      var emailId     = (document.getElementById('fieldEmailId')     || {}).value || '';
      var emailDomain = (document.getElementById('fieldEmailDomain') || {}).value || '';
      var countryCode = (document.getElementById('fieldCountryCode') || {}).value || '';
      var telNumber   = (document.getElementById('fieldTelNumber')   || {}).value || '';

      var payload = {
        name:    (document.getElementById('fieldName')    || {}).value || '',
        phone:   countryCode + ' ' + telNumber,
        email:   emailId + '@' + emailDomain,
        company: (document.getElementById('fieldCompany') || {}).value || '',
        subject: (document.getElementById('fieldSubject') || {}).value || '',
        content: (document.getElementById('fieldContent') || {}).value || '',
      };

      try {
        var { createClient } = supabase;
        var sb = createClient(
          'https://qdxivfcrtipqcmodekkk.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeGl2ZmNydGlwcWNtb2Rla2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Nzc3NTAsImV4cCI6MjA4OTU1Mzc1MH0.GHY0aYFit4vbqjZrAovc12zIqIjQslPYcU3c8m4XcEs'
        );

        var { error } = await sb.from('contacts').insert([payload]);

        if (!error) {
          if (btn) {
            btn.textContent = '전송 완료!';
            btn.classList.add('is-success');
            setTimeout(function () {
              btn.textContent = '문의 전송';
              btn.classList.remove('is-success');
              btn.disabled = false;
              form.reset();
              if (checkboxCustom) checkboxCustom.classList.remove('is-checked');
            }, 3000);
          }
        } else {
          if (btn) {
            btn.textContent = '전송 실패. 다시 시도해주세요.';
            btn.disabled = false;
            setTimeout(function () { btn.textContent = '문의 전송'; }, 3000);
          }
        }
      } catch (err) {
        if (btn) {
          btn.textContent = '오류가 발생했습니다.';
          btn.disabled = false;
          setTimeout(function () { btn.textContent = '문의 전송'; }, 3000);
        }
      }
    });
  }

  /* ============================================================
     Initialise on DOM ready
  ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    activateGnb();
  });

})();
