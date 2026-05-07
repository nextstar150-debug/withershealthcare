/* ===========================================
   WITHUS HEALTHCARE — recruitment.js
   채용정보 (Recruitment) page — Supabase 연동 버전
   =========================================== */
(function () {
  'use strict';

  /* ============================================
     SUPABASE 초기화
  ============================================ */
  const { createClient } = supabase;
  const sb = createClient(
    'https://qdxivfcrtipqcmodekkk.supabase.co',  // ← 본인 Project URL로 교체
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeGl2ZmNydGlwcWNtb2Rla2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Nzc3NTAsImV4cCI6MjA4OTU1Mzc1MH0.GHY0aYFit4vbqjZrAovc12zIqIjQslPYcU3c8m4XcEs'       // ← 본인 anon key로 교체
  );

  /* ============================================
     SCROLL TO TOP
  ============================================ */
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================
     CUSTOM DROPDOWNS — 직군 / 경력
  ============================================ */
  var dropdowns = document.querySelectorAll('.rc-dropdown');

  dropdowns.forEach(function (dropdown) {
    var btn         = dropdown.querySelector('.rc-dropdown__btn');
    var list        = dropdown.querySelector('.rc-dropdown__list');
    var textEl      = dropdown.querySelector('.rc-dropdown__text');
    var options     = dropdown.querySelectorAll('.rc-dropdown__list li');
    var placeholder = dropdown.dataset.placeholder || '';

    if (!btn || !list) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = list.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      dropdowns.forEach(function (other) {
        if (other === dropdown) return;
        var ob = other.querySelector('.rc-dropdown__btn');
        var ol = other.querySelector('.rc-dropdown__list');
        if (ol) { ol.classList.remove('is-open'); if (ob) ob.setAttribute('aria-expanded', 'false'); }
      });
    });

    options.forEach(function (option) {
      option.addEventListener('click', function () {
        var value = option.dataset.value || option.textContent.trim();
        options.forEach(function (o) { o.classList.remove('is-selected'); o.setAttribute('aria-selected', 'false'); });
        option.classList.add('is-selected');
        option.setAttribute('aria-selected', 'true');
        if (textEl) textEl.textContent = value;
        list.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        applyFilters();
      });
    });

    list.addEventListener('keydown', function (e) {
      var items   = Array.from(options);
      var focused = document.activeElement;
      var idx     = items.indexOf(focused);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (idx < items.length - 1) items[idx + 1].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (idx > 0) items[idx - 1].focus(); else btn.focus(); }
      else if (e.key === 'Escape') { list.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (focused && focused.getAttribute('role') === 'option') focused.click(); }
    });
    options.forEach(function (opt) { opt.setAttribute('tabindex', '0'); });
  });

  document.addEventListener('click', function () {
    dropdowns.forEach(function (dropdown) {
      var btn  = dropdown.querySelector('.rc-dropdown__btn');
      var list = dropdown.querySelector('.rc-dropdown__list');
      if (list) { list.classList.remove('is-open'); if (btn) btn.setAttribute('aria-expanded', 'false'); }
    });
  });

  /* ============================================
     FILTER RESET
  ============================================ */
  var resetBtn = document.getElementById('rcResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      dropdowns.forEach(function (dropdown) {
        var textEl      = dropdown.querySelector('.rc-dropdown__text');
        var options     = dropdown.querySelectorAll('.rc-dropdown__list li');
        var placeholder = dropdown.dataset.placeholder || '';
        if (textEl) textEl.textContent = placeholder;
        options.forEach(function (o, i) {
          o.classList.toggle('is-selected', i === 0);
          o.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        });
      });
      var searchInput = document.getElementById('rcSearchInput');
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }

  /* ============================================
     SEARCH
  ============================================ */
  var searchInput = document.getElementById('rcSearchInput');
  var searchBtn   = document.querySelector('.rc-search__btn');

  if (searchInput) {
    searchInput.addEventListener('input', function () { applyFilters(); });
    searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyFilters(); } });
  }
  if (searchBtn) { searchBtn.addEventListener('click', function () { applyFilters(); }); }

  /* ============================================
     FILTER LOGIC
  ============================================ */
  var allItems    = [];
  var noResultsEl = document.getElementById('rcNoResults');

  function getDropdownValue(dropdownId) {
    var dropdown = document.getElementById(dropdownId);
    if (!dropdown) return '';
    var selected = dropdown.querySelector('.rc-dropdown__list li.is-selected');
    return selected ? (selected.dataset.value || selected.textContent.trim()) : '';
  }

  function applyFilters() {
    var jobFilter    = getDropdownValue('rcDropJob');
    var careerFilter = getDropdownValue('rcDropCareer');
    var keyword      = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visibleCount = 0;

    allItems = Array.from(document.querySelectorAll('.rc-list-item'));

    allItems.forEach(function (item) {
      var itemJob    = item.dataset.job    || '';
      var itemCareer = item.dataset.career || '';
      var titleEl    = item.querySelector('.rc-list-item__title');
      var titleText  = titleEl ? titleEl.textContent.toLowerCase() : '';

      var jobMatch     = (jobFilter    === '전체 직군'      || jobFilter    === '' || itemJob    === jobFilter);
      var careerMatch  = (careerFilter === '전체 경력 사항' || careerFilter === '' || itemCareer === careerFilter);
      var keywordMatch = (keyword === '' || titleText.includes(keyword));

      var visible = jobMatch && careerMatch && keywordMatch;
      item.hidden = !visible;
      if (visible) visibleCount++;
    });

    if (noResultsEl) noResultsEl.hidden = visibleCount > 0;
    updatePagination();
  }

  /* ============================================
     PAGINATION
  ============================================ */
  var ITEMS_PER_PAGE = 5;
  var currentPage    = 1;

  var pageFirst = document.getElementById('rcPageFirst');
  var pagePrev  = document.getElementById('rcPagePrev');
  var pageNext  = document.getElementById('rcPageNext');
  var pageLast  = document.getElementById('rcPageLast');
  var pageNums  = document.getElementById('rcPageNums');

  function getVisibleItems() {
    return Array.from(document.querySelectorAll('.rc-list-item')).filter(function (item) { return !item.hidden; });
  }

  function getTotalPages(visibleItems) {
    return Math.max(1, Math.ceil(visibleItems.length / ITEMS_PER_PAGE));
  }

  function renderPage(page) {
    var visible    = getVisibleItems();
    var totalPages = getTotalPages(visible);
    currentPage    = Math.max(1, Math.min(page, totalPages));
    var start = (currentPage - 1) * ITEMS_PER_PAGE;
    var end   = start + ITEMS_PER_PAGE;

    visible.forEach(function (item, idx) {
      item.style.display = (idx >= start && idx < end) ? '' : 'none';
    });

    if (pageNums) {
      pageNums.innerHTML = '';
      for (var p = 1; p <= totalPages; p++) {
        var btn = document.createElement('button');
        btn.className = 'pag-page' + (p === currentPage ? ' pag-page--active' : '');
        btn.setAttribute('data-page', p);
        btn.setAttribute('aria-label', p + '페이지');
        if (p === currentPage) btn.setAttribute('aria-current', 'page');
        btn.textContent = p;
        btn.addEventListener('click', function (e) { renderPage(parseInt(e.currentTarget.dataset.page, 10)); });
        pageNums.appendChild(btn);
      }
    }

    if (pageFirst) pageFirst.disabled = currentPage === 1;
    if (pagePrev)  pagePrev.disabled  = currentPage === 1;
    if (pageNext)  pageNext.disabled  = currentPage === totalPages;
    if (pageLast)  pageLast.disabled  = currentPage === totalPages;
  }

  function updatePagination() { renderPage(1); }

  if (pageFirst) pageFirst.addEventListener('click', function () { renderPage(1); });
  if (pagePrev)  pagePrev.addEventListener('click',  function () { renderPage(currentPage - 1); });
  if (pageNext)  pageNext.addEventListener('click',  function () { renderPage(currentPage + 1); });
  if (pageLast)  pageLast.addEventListener('click',  function () {
    renderPage(getTotalPages(getVisibleItems()));
  });

  /* ============================================
     SUPABASE — 공고 목록 로드
  ============================================ */
  async function loadJobs() {
    const listEl = document.getElementById('rcList');
    if (!listEl) return;

    const { data: jobs, error } = await sb
      .from('jobs')
      .select('id, title, job_type, career, hire_type, deadline, status, created_at')
      .order('status', { ascending: false })
      .order('deadline', { ascending: false, nullsFirst: false });

    if (error || !jobs) {
      listEl.innerHTML = '<li class="rc-list-empty">공고를 불러올 수 없습니다.</li>';
      return;
    }

    // 기존 하드코딩 항목 제거 후 동적 생성
    listEl.innerHTML = '';

    if (!jobs.length) {
      /* 현재 진행 중인 공고가 없을 때 리스트 영역에 안내 문구 표시 */
      listEl.innerHTML = '<li class="rc-list-empty">현재 진행 중인 채용 공고가 없습니다.</li>';
      updatePagination();
      return;
    }

    jobs.forEach(function (job) {
      var isOpen      = job.status === 'open';
      var deadlineStr = '';

      if (job.deadline) {
        var d = new Date(job.deadline);
        var yy = d.getFullYear();
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        var hh = String(d.getHours()).padStart(2, '0');
        var mi = String(d.getMinutes()).padStart(2, '0');
        deadlineStr = yy + '.' + mm + '.' + dd + ' ~ ' + yy + '.' + mm + '.' + dd + ' ' + hh + ':' + mi;
      } else {
        deadlineStr = '상시 채용';
      }

      var li = document.createElement('li');
      li.className        = 'rc-list-item';
      li.dataset.job      = job.job_type || '';
      li.dataset.career   = job.career   || '';
      li.dataset.status   = job.status   || 'open';

      li.innerHTML =
        '<a href="recruitment-detail.html?id=' + job.id + '" class="rc-list-item__link">' +
          '<div class="rc-list-item__info">' +
            '<div class="rc-list-item__tags">' +
              '<span class="rc-tag">' + escHtml(job.hire_type || '일반채용') + '</span>' +
              '<span class="rc-tag">' + escHtml(job.career) + '</span>' +
            '</div>' +
            '<div class="rc-list-item__body">' +
              '<p class="rc-list-item__title">' + escHtml(job.title) + '</p>' +
              '<p class="rc-list-item__date">' + escHtml(deadlineStr) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="rc-status-btn ' + (isOpen ? 'rc-status-btn--open' : 'rc-status-btn--closed') + '" aria-label="' + (isOpen ? '접수중' : '접수마감') + '">' +
            '<img src="assets/register.svg" alt="" width="18" height="18" class="' + (isOpen ? 'rc-status-icon--open' : 'rc-status-icon--closed') + '">' +
            '<span>' + (isOpen ? '접수중' : '접수마감') + '</span>' +
          '</div>' +
        '</a>';

      listEl.appendChild(li);
    });

    // 로드 후 필터/페이지네이션 초기화
    applyFilters();

    // Scroll reveal
    initReveal();
  }

  /* ============================================
     SCROLL REVEAL
  ============================================ */
  function initReveal() {
    var revealTargets = document.querySelectorAll('.rc-step-card, .rc-list-item');
    if (!('IntersectionObserver' in window) || !revealTargets.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    revealTargets.forEach(function (el) { el.classList.add('reveal'); obs.observe(el); });
  }

  /* ============================================
     UTILS
  ============================================ */
  function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── 초기 로드 ── */
  loadJobs();

})();
