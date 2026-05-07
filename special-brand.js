/* ===========================================================
   WITHUS HEALTHCARE — special-brand.js
   스페셜 프로덕트(알리스타) 페이지: 스크롤 reveal (style.css .reveal 연동)
   — 베이지 split inner(.sb-section__inner--beige-reveal)는 느슨한 임계값으로
     화면을 조금 내린 뒤 콘텐츠가 드러나게 함
   =========================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var revealEls = document.querySelectorAll('.sb-alistar .reveal');
    if (!revealEls || revealEls.length === 0) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) {
        if (el) { el.classList.add('in-view'); }
      });
      return;
    }

    function onReveal(entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }

    var optsDefault = { threshold: 0.05, rootMargin: '0px' };
    /* inner 전용: 아래로 스크롤하며 뷰포트에 더 들어온 뒤에만 in-view (배경만 먼저 보이는 효과) */
    var optsBeigeInner = { threshold: 0.2, rootMargin: '0% 0% -20% 0%' };

    var revealObserver = new IntersectionObserver(onReveal, optsDefault);
    var beigeInnerObserver = new IntersectionObserver(onReveal, optsBeigeInner);

    function markIfAlreadyVisible() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (!el || el.classList.contains('in-view')) return;
        /* 베이지 inner: 첫 프레임에 강제로 켜지지 않고 스크롤/IO에만 맡김 */
        if (el.classList.contains('sb-section__inner--beige-reveal')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          el.classList.add('in-view');
          try { revealObserver.unobserve(el); } catch (e) {}
        }
      });
    }

    revealEls.forEach(function (el) {
      if (!el) return;
      if (el.classList.contains('sb-section__inner--beige-reveal')) {
        beigeInnerObserver.observe(el);
      } else {
        revealObserver.observe(el);
      }
    });

    markIfAlreadyVisible();
    requestAnimationFrame(markIfAlreadyVisible);
  });
})();
