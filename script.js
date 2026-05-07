/* ===========================================
   WITHUS HEALTHCARE — script.js
   =========================================== */
   (function () {
    'use strict';

    /* ============================================
       GNB is-active 자동 활성화 (전 페이지 공통)
       - window.location.pathname 기반
       - 부모 메뉴(서브메뉴 보유)도 함께 활성화
    ============================================ */
    function normalizePath(p) {
      if (!p) return '';
      var s = String(p);
      s = s.split('#')[0].split('?')[0];
      return s.replace(/\\/g, '/');
    }

    function getCurrentFile() {
      var path = normalizePath(window.location.pathname);
      var file = path.split('/').pop() || 'index.html';
      return file;
    }

    function markActiveLinks() {
      var currentFile = getCurrentFile();

      /* top nav */
      var navLinks = document.querySelectorAll('.nav-links a[href], .drawer a[href]');
      if (!navLinks || navLinks.length === 0) return;

      navLinks.forEach(function (link) {
        if (!link) return;
        var href = link.getAttribute('href');
        if (!href) return;

        var cleanHref = normalizePath(href);
        if (cleanHref.indexOf('http') === 0 || cleanHref.indexOf('mailto:') === 0 || cleanHref.indexOf('tel:') === 0) return;
        if (cleanHref === '#' || cleanHref === '') return;

        var hrefFile = cleanHref.replace(/^\.\//, '').split('/').pop();
        if (!hrefFile) return;

        if (hrefFile === currentFile) {
          link.classList.add('is-active');

          var navItem = link.closest('.nav-item--has-sub');
          if (navItem) {
            var parent = navItem.querySelector('.nav-link');
            if (parent) parent.classList.add('is-active');
          }
        }
      });
    }

    document.addEventListener('DOMContentLoaded', markActiveLinks);

    /* ---- 플로팅 배너 스크롤 제어 (전 페이지 공통) ---- */
    const floatingBanner = document.querySelector('.floating-banner');
    if (floatingBanner) {
      const updateFloatingBanner = () => {
        if (window.scrollY > 300) {
          floatingBanner.classList.add('is-visible');
        } else {
          floatingBanner.classList.remove('is-visible');
        }
      };

      updateFloatingBanner();
      window.addEventListener('scroll', updateFloatingBanner, { passive: true });
    }
  
    /* ---- Nav: transparent → solid on scroll ---- */
    var header = document.getElementById('header');
  
    function updateHeader() {
      if (!header) return; /* Null check */
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  
    /* ============================================
       언어 드롭다운 — 클릭 시 열기/닫기
    ============================================ */
    var langBtn = document.getElementById('navLangBtn');
    var langDropdown = document.getElementById('langDropdown');
  
    if (langBtn && langDropdown) {
      /* 버튼 클릭 시 토글 */
      langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = langDropdown.classList.toggle('is-open');
        langBtn.setAttribute('aria-expanded', String(isOpen));
      });
  
      /* 드롭다운 외부 클릭 시 닫기 */
      document.addEventListener('click', function (e) {
        if (!e.target.closest('#navLangWrap')) {
          langDropdown.classList.remove('is-open');
          langBtn.setAttribute('aria-expanded', 'false');
        }
      });
  
      /* Escape 키로 닫기 */
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          langDropdown.classList.remove('is-open');
          langBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  
    /* ============================================
       GNB 서브메뉴 — 키보드 접근성 처리
       마우스 호버는 CSS만으로 처리,
       JS는 aria-expanded 상태 동기화만 담당
    ============================================ */
    var navItems = document.querySelectorAll('.nav-item--has-sub');
  
    navItems.forEach(function (item) {
      var link = item.querySelector('.nav-link');
      var submenu = item.querySelector('.nav-submenu');
  
      if (!link || !submenu) return; /* Null check */
  
      /* 마우스 진입 시 aria-expanded 갱신 */
      item.addEventListener('mouseenter', function () {
        link.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', function () {
        link.setAttribute('aria-expanded', 'false');
      });
  
      /* 키보드: Enter/Space로 서브메뉴 열기 */
      link.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var isOpen = item.classList.toggle('is-open');
          link.setAttribute('aria-expanded', String(isOpen));
        }
        /* Escape로 서브메뉴 닫기 */
        if (e.key === 'Escape') {
          item.classList.remove('is-open');
          link.setAttribute('aria-expanded', 'false');
          link.focus();
        }
      });
  
      /* 모바일: 탭/클릭으로 서브메뉴 열기(=hover 대체) */
      link.addEventListener('click', function (e) {
        var isMobile = false;
        try {
          isMobile = !!(window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
        } catch (err) {
          isMobile = false;
        }
        if (!isMobile) return;

        /* 서브메뉴가 있는 최상위 항목은 모바일에서 아코디언 토글로 사용 */
        e.preventDefault();

        /* 다른 열린 서브메뉴 닫기 */
        navItems.forEach(function (otherItem) {
          if (otherItem === item) return;
          otherItem.classList.remove('is-open');
          var otherLink = otherItem.querySelector('.nav-link');
          if (otherLink) otherLink.setAttribute('aria-expanded', 'false');
        });

        var isOpen = item.classList.toggle('is-open');
        link.setAttribute('aria-expanded', String(isOpen));
      });

      /* 포커스가 서브메뉴 밖으로 나가면 닫기 */
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) {
          item.classList.remove('is-open');
          link.setAttribute('aria-expanded', 'false');
        }
      });
    });
  
    /* 외부 클릭 시 열린 서브메뉴 닫기 */
    document.addEventListener('click', function (e) {
      navItems.forEach(function (item) {
        if (!item.contains(e.target)) {
          var link = item.querySelector('.nav-link');
          item.classList.remove('is-open');
          if (link) link.setAttribute('aria-expanded', 'false');
        }
      });
    });
  
    /* ---- Floating sidebar: 스크롤 시 표시, 호버 시 유지 ---- */
    var sidebar = document.querySelector('.hero-sidebar');
    var sidebarHideTimer;
  
    function showSidebar() {
      if (!sidebar) return;
      sidebar.classList.remove('is-hidden');
      clearTimeout(sidebarHideTimer);
      sidebarHideTimer = setTimeout(function () {
        /* 마우스가 사이드바 위에 있으면 숨기지 않음 */
        if (!sidebar.matches(':hover')) {
          sidebar.classList.add('is-hidden');
        }
      }, 1000);
    }
  
    if (sidebar) {
      showSidebar();
      window.addEventListener('scroll', showSidebar, { passive: true });
  
      /* 호버 시 타이머 취소 → 배너 유지 */
      sidebar.addEventListener('mouseenter', function () {
        clearTimeout(sidebarHideTimer);
        sidebar.classList.remove('is-hidden');
      });
  
      /* 마우스 나가면 1초 후 숨김 재개 */
      sidebar.addEventListener('mouseleave', function () {
        sidebarHideTimer = setTimeout(function () {
          sidebar.classList.add('is-hidden');
        }, 1000);
      });
  
      /* 화살표(scroll-ind) 클릭 시 맨 위로 스크롤 */
      var scrollInd = sidebar.querySelector('.sidebar-scroll-ind');
      if (scrollInd) {
        scrollInd.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    }
  
    /* ---- 드로어 네비게이션 (1024px 이하) ----
       hamburger 클릭 → 오른쪽 사이드 드로어 슬라이드인
       drawerClose / overlay 클릭 → 닫기
       drawer__item--has-sub 버튼 → 아코디언 서브메뉴 토글
    ---- */
    var hamburger     = document.getElementById('navHamburger');
    var navDrawer     = document.getElementById('navDrawer');
    var drawerOverlay = document.getElementById('drawerOverlay');
    var drawerClose   = document.getElementById('drawerClose');

    /* 드로어 열기 */
    function openDrawer() {
      if (!navDrawer) return;
      navDrawer.classList.add('is-open');
      navDrawer.setAttribute('aria-hidden', 'false');
      if (drawerOverlay) {
        drawerOverlay.style.display = 'block';
        /* display 변경 후 한 프레임 뒤 opacity 전환 (트랜지션 적용) */
        requestAnimationFrame(function () {
          drawerOverlay.classList.add('is-open');
        });
      }
      if (hamburger) {
        hamburger.classList.add('is-open');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', '메뉴 닫기');
      }
      document.body.style.overflow = 'hidden'; /* 배경 스크롤 잠금 */
    }

    /* 드로어 닫기 */
    function closeDrawer() {
      if (!navDrawer) return;
      navDrawer.classList.remove('is-open');
      navDrawer.setAttribute('aria-hidden', 'true');
      if (drawerOverlay) {
        drawerOverlay.classList.remove('is-open');
        /* opacity 트랜지션 후 display:none */
        setTimeout(function () {
          if (!drawerOverlay.classList.contains('is-open')) {
            drawerOverlay.style.display = 'none';
          }
        }, 350);
      }
      if (hamburger) {
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', '메뉴 열기');
      }
      document.body.style.overflow = ''; /* 스크롤 잠금 해제 */
    }

    /* 햄버거 버튼 토글 */
    if (hamburger) {
      hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        hamburger.classList.contains('is-open') ? closeDrawer() : openDrawer();
      });
    }

    /* 오버레이 클릭 시 닫기 */
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', closeDrawer);
    }

    /* X 버튼 클릭 시 닫기 */
    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }

    /* Escape 키로 닫기 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navDrawer && navDrawer.classList.contains('is-open')) {
        closeDrawer();
        if (hamburger) hamburger.focus();
      }
    });

    /* 드로어 내 링크 클릭 시 닫기 */
    if (navDrawer) {
      navDrawer.querySelectorAll('.drawer__sub-link, .drawer__btn--link').forEach(function (link) {
        link.addEventListener('click', closeDrawer);
      });
    }

    /* ── 아코디언 서브메뉴 토글 ──
       drawer__item--has-sub > drawer__btn 클릭 시
       해당 drawer__sub 열고, 나머지는 닫기 */
    if (navDrawer) {
      var drawerSubBtns = navDrawer.querySelectorAll('.drawer__item--has-sub > .drawer__btn');
      drawerSubBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var isExpanded = btn.getAttribute('aria-expanded') === 'true';
          var targetId   = btn.getAttribute('aria-controls');
          var targetSub  = targetId ? document.getElementById(targetId) : null;

          /* 다른 열린 서브메뉴 모두 닫기 */
          drawerSubBtns.forEach(function (otherBtn) {
            if (otherBtn === btn) return;
            otherBtn.setAttribute('aria-expanded', 'false');
            var otherId  = otherBtn.getAttribute('aria-controls');
            var otherSub = otherId ? document.getElementById(otherId) : null;
            if (otherSub) otherSub.classList.remove('is-open');
          });

          /* 현재 토글 */
          btn.setAttribute('aria-expanded', String(!isExpanded));
          if (targetSub) targetSub.classList.toggle('is-open', !isExpanded);
        });
      });
    }
  
    /* ============================================
       Hero Slide — 5초 페이드 자동 전환
       버그 수정:
       1. slideEls null 체크
       2. mouseenter 타이머 정지 제거 (자동 전환 멈춤 방지)
       3. 버튼 클릭 이벤트 stopPropagation으로 외부클릭 충돌 방지
    ============================================ */
    var TOTAL_SLIDES = 3;
    var currentSlide = 0;
    var slideNumEl = document.getElementById('slideNum');
    var prevBtn    = document.getElementById('heroPrev');
    var nextBtn    = document.getElementById('heroNext');
    var slideEls   = document.querySelectorAll('.hero-slide');
    var slideTimer;
  
    /* slideEls 없으면 슬라이드 로직 전체 skip */
    if (slideEls.length > 0) {
  
      function goToSlide(index) {
        currentSlide = ((index % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES;
        slideEls.forEach(function (el) { el.classList.remove('is-active'); });
        slideEls[currentSlide].classList.add('is-active');
        if (slideNumEl) {
          var n = currentSlide + 1;
          slideNumEl.textContent = n < 10 ? '0' + n : '' + n;
        }
      }
  
      function startTimer() {
        clearInterval(slideTimer);
        slideTimer = setInterval(function () {
          goToSlide(currentSlide + 1);
        }, 5000);
      }
  
      /* 초기화 */
      goToSlide(0);
      startTimer();
  
      /* 화살표 버튼 — stopPropagation으로 외부클릭 이벤트 충돌 방지 */
      if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          goToSlide(currentSlide - 1);
          startTimer();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          goToSlide(currentSlide + 1);
          startTimer();
        });
      }
    }
  
    /* ============================================
       Medical Solutions — 슬라이딩 언더라인 탭 + 자동 전환
       설계:
       - 탭 DOM 순서 완전 고정
       - 갤러리: translateX 슬라이딩 (전체 fade 없음)
       - 텍스트(ms-info)만 fade 교체
       - 5초 자동 전환, 마우스오버 일시 정지
    ============================================ */
    /* 페이지 최초 진입 시(로드 직후) 자동 시작 방지용:
       "섹션이 뷰포트에 들어오는 순간"을 스크롤/휠 등으로 발생한 이후로 제한 */
    var pageScrollDetected = false;
    window.addEventListener('scroll', function () {
      pageScrollDetected = true;
      window.dispatchEvent(new Event('withus:firstscroll'));
    }, { passive: true, once: true });

    var msTabs         = document.getElementById('msTabs');
    var msUnderline    = document.getElementById('msTabUnderline');
    var msInfo         = document.querySelector('.ms-info');   /* 텍스트 영역만 fade */
    var msProductLabel = document.getElementById('msProductLabel');
    var msProductName  = document.getElementById('msProductName');
    var msProductDesc  = document.getElementById('msProductDesc');
    var msGalleryTrack = document.getElementById('msGalleryTrack');
    var allTabs        = document.querySelectorAll('.ms-tab');
    /* 복제 슬라이드(--clone) 제외 — 오버레이 토글은 실제 10개만 */
    var allSlides      = document.querySelectorAll('.ms-gallery-slide:not(.ms-gallery-slide--clone)');
    /* 클리비 임시 비노출: 탭/슬라이드 인덱스 6 순환 및 갤러리 이동에서 제외 (index.html is-hidden--temp와 대응) */
    var MS_SKIP_TAB_IDX = 6;

    function msSlideUsesLayout(slide) {
      return slide && !slide.classList.contains('is-hidden--temp');
    }

    function getMsGalleryTranslatePx(beforeSlideIndex) {
      var px = 0;
      for (var si = 0; si < beforeSlideIndex && si < allSlides.length; si++) {
        if (!msSlideUsesLayout(allSlides[si])) continue;
        px += allSlides[si].offsetWidth + SLIDE_GAP;
      }
      return px;
    }

    /* 제품 상세 URL — data-index / 슬라이드 인덱스 0~9와 동일 순서 */
    var MS_DETAIL_URLS = [
      './brand-detail-carragel-s.html',
      './brand-detail-carragel-t.html',
      './brand-detail-avarus.html',
      './brand-detail-regensta-a.html',
      './brand-detail-regensta-b.html',
      './brand-detail-regensta-h.html',
      './brand-detail-clevy-spray.html',
      './brand-detail-regensta-g-cream.html',
      './brand-detail-scargel-combination.html',
      './brand-detail-megaheal.html'
    ];
    var msViewMore = document.querySelector('.medical-solutions .btn-view-more.btn-blue');

    var SLIDE_GAP     = 20;
    var AUTO_INTERVAL = 3000;
    var currentIndex  = 0;
    var autoTimer     = null;

    /* ── 언더라인 바 위치 + 너비 업데이트 ── */
    function updateUnderline(activeTab) {
      if (!msUnderline || !activeTab) return;
      msUnderline.style.width     = activeTab.offsetWidth + 'px';
      msUnderline.style.transform = 'translateX(' + activeTab.offsetLeft + 'px)';
    }

    /* ── 갤러리 트랙 슬라이딩 + 오버레이 토글 ──
       전체 fade 없이 translateX만으로 이동 */
    function updateGallery(idx) {
      if (!msGalleryTrack || allSlides.length === 0) return;
      msGalleryTrack.style.transform = 'translateX(-' + getMsGalleryTranslatePx(idx) + 'px)';
      allSlides.forEach(function (s, i) {
        s.classList.toggle('is-active-slide', i === idx);
      });
    }

    /* ── 텍스트만 fade 교체 ──
       갤러리(이미지)는 건드리지 않음 */
    function updateContent(tab) {
      if (!msInfo) return;
      msInfo.classList.add('is-fading');
      setTimeout(function () {
        if (msProductLabel) msProductLabel.textContent = tab.dataset.label || '';
        if (msProductName)  msProductName.textContent  = tab.dataset.name  || '';
        if (msProductDesc)  msProductDesc.textContent  = tab.dataset.desc  || '';
        msInfo.classList.remove('is-fading');
      }, 250);
    }

    /* ── 탭 전환 ── */
    function goToTab(idx) {
      var nextIdx = ((idx % allTabs.length) + allTabs.length) % allTabs.length;
      if (nextIdx === MS_SKIP_TAB_IDX) {
        nextIdx = MS_SKIP_TAB_IDX + 1;
      }
      if (nextIdx === currentIndex) return;
      var nextTab = allTabs[nextIdx];
      if (!nextTab) return;

      allTabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      nextTab.classList.add('is-active');
      nextTab.setAttribute('aria-selected', 'true');
      currentIndex = nextIdx;

      updateUnderline(nextTab);  /* 탭 언더라인 이동 */
      updateGallery(nextIdx);    /* 이미지 슬라이딩 */
      updateContent(nextTab);    /* 텍스트만 fade */
    }

    /* View More — currentIndex 기준 href (Observer 등 goToTab 비경로에서도 동기화하려면 아래 폴링 사용) */
    function updateViewMoreHref() {
      if (!msViewMore || MS_DETAIL_URLS.length === 0) return;
      if (currentIndex < 0 || currentIndex >= MS_DETAIL_URLS.length) return;
      var url = MS_DETAIL_URLS[currentIndex];
      if (url) msViewMore.setAttribute('href', url);
    }

    /* ── 자동 전환 ── */
    function startAutoTimer() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        goToTab(currentIndex + 1);
      }, AUTO_INTERVAL);
    }

    /* ── 초기화 ── */
    if (msTabs && allTabs.length > 0) {

      allTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var idx = parseInt(tab.dataset.index, 10);
          if (idx === currentIndex) return;
          goToTab(idx);
          updateViewMoreHref();
          startAutoTimer();
        });
      });

      /* ── 자동 전환: 섹션이 화면에 들어올 때만 시작 (Intersection Observer) ── */
      var msSection = document.querySelector('.medical-solutions');
      var msStarted = false; /* 최초 1회만 초기화 */
      var msPendingEnter = false; /* 로드 시 이미 보이던 케이스 보정 */

      if (msSection && 'IntersectionObserver' in window) {
        var msObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            var isEnter = entry.intersectionRatio >= 0.3;
            var isFullyOut = entry.intersectionRatio === 0;

            if (isEnter) {
              if (!pageScrollDetected) {
                msPendingEnter = true;
                return; /* 최초 로드 직후 자동 시작 방지 */
              }
              if (!msStarted) {
                /* 섹션 진입 시 1번 탭부터 정확히 초기화 후 자동재생 시작 */
                msStarted = true;
                currentIndex = 0;
                requestAnimationFrame(function () {
                  /* 초기 위치 세팅은 transition 없이 즉시 이동 */
                  if (msGalleryTrack) msGalleryTrack.style.transition = 'none';
                  updateUnderline(allTabs[0]);
                  updateGallery(0);
                  updateContent(allTabs[0]);
                  /* transition 복원 후 자동재생 시작 */
                  requestAnimationFrame(function () {
                    if (msGalleryTrack) msGalleryTrack.style.transition = '';
                    startAutoTimer();
                  });
                });
              } else {
                startAutoTimer(); /* 재진입 시 재개 */
              }
            } else if (isFullyOut) {
              clearInterval(autoTimer); /* 섹션 완전 이탈 시 정지 */
            }
          });
        }, { threshold: [0, 0.3] }); /* 30% 진입 / 완전 이탈(0) 모두 감지 */

        msObserver.observe(msSection);

        /* 로드 시 이미 섹션이 보이던 경우:
           첫 스크롤이 발생하는 순간 pending 상태면 즉시 시작 */
        window.addEventListener('withus:firstscroll', function () {
          if (!msPendingEnter) return;
          msPendingEnter = false;
          if (!msStarted) {
            msStarted = true;
            currentIndex = 0;
            requestAnimationFrame(function () {
              /* 초기 위치 세팅은 transition 없이 즉시 이동 */
              if (msGalleryTrack) msGalleryTrack.style.transition = 'none';
              updateUnderline(allTabs[0]);
              updateGallery(0);
              updateContent(allTabs[0]);
              requestAnimationFrame(function () {
                if (msGalleryTrack) msGalleryTrack.style.transition = '';
                startAutoTimer();
              });
            });
          } else {
            startAutoTimer();
          }
        });
      } else if (msSection) {
        /* IntersectionObserver 미지원 브라우저 fallback */
        /* 요구사항: 뷰포트 진입 전까지 루프 금지.
           미지원 환경에서는 스크롤 발생 이후에만 시작(최소한의 보호). */
        window.addEventListener('scroll', function () {
          if (!msStarted) {
            msStarted = true;
            currentIndex = 0;
            requestAnimationFrame(function () {
              updateUnderline(allTabs[0]);
              updateGallery(0);
              updateContent(allTabs[0]);
            });
          }
          startAutoTimer();
        }, { passive: true, once: true });
      }

      /* View More href: currentIndex 동기화 (IntersectionObserver 경로는 goToTab을 호출하지 않음) */
      updateViewMoreHref();
      setInterval(updateViewMoreHref, 200);

      /* 갤러리: 클릭한 실제 슬라이드(비클론) 인덱스 → 해당 상세로 이동 */
      if (msGalleryTrack && allSlides && allSlides.length > 0 && MS_DETAIL_URLS.length > 0) {
        msGalleryTrack.addEventListener('click', function (e) {
          if (!e.target || !e.target.closest) return;
          var slide = e.target.closest('.ms-gallery-slide');
          if (!slide) return;
          if (slide.classList.contains('ms-gallery-slide--clone')) return;
          if (slide.classList.contains('is-hidden--temp')) return;
          if (slide.getAttribute('aria-hidden') === 'true') return;
          var idx = Array.prototype.indexOf.call(allSlides, slide);
          if (idx < 0 || idx >= MS_DETAIL_URLS.length) return;
          var url = MS_DETAIL_URLS[idx];
          if (url) window.location.href = url;
        });
      }
    }
  
    /* ---- Scroll Reveal ---- */
    var revealTargets = document.querySelectorAll(
      '.vision-card, .about-inner, .ms-inner, .rd-inner, .mall-card, .brand-inner'
    );
  
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  
      revealTargets.forEach(function (el) {
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    }
  
    /* ---- Smooth scroll for anchor links ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    /* ============================================
       Brand Products — 로고 슬라이드
       - 항상 7개 노출 고정
       - prev/pause/next 버튼 + 마우스 드래그 지원
       - 3초 자동 전환
    ============================================ */
    var brandTrack  = document.getElementById('brandTrack');
    var brandPrev   = document.getElementById('brandPrev');
    var brandPause  = document.getElementById('brandPause');
    var brandNext   = document.getElementById('brandNext');

    if (brandTrack) {
      var brandItems  = brandTrack.querySelectorAll('.brand-logo-item');
      var brandIndex  = 0;
      var brandPaused = false;
      var brandTimer  = null;
      var BRAND_VISIBLE = 7;   /* 1920px 기준 최대 노출 개수 */
      var BRAND_GAP   = 8;
      var brandStartedOnce = false; /* 최초 진입 시 1회만 index 0으로 초기화 */
      var brandPendingEnter = false; /* 로드 시 이미 보이던 케이스 보정 */

      function brandLogoUsesLayout(el) {
        return el && !el.classList.contains('is-hidden--temp');
      }

      function getBrandLayoutItemCount() {
        var n = 0;
        for (var bi = 0; bi < brandItems.length; bi++) {
          if (brandLogoUsesLayout(brandItems[bi])) n++;
        }
        return n;
      }

      function getBrandScrollOffsetPx(stepCount) {
        var px = 0;
        var used = 0;
        for (var bj = 0; bj < brandItems.length && used < stepCount; bj++) {
          if (!brandLogoUsesLayout(brandItems[bj])) continue;
          px += brandItems[bj].offsetWidth + BRAND_GAP;
          used++;
        }
        return px;
      }

      /* 뷰포트 너비에 따라 실제 노출 가능한 아이템 수를 계산 */
      function getVisibleCount() {
        var wrap = brandTrack.parentElement;
        if (!wrap || !brandItems[0]) return BRAND_VISIBLE;
        /* wrap의 실제 가용 너비를 기준으로 몇 개 들어가는지 산출 */
        var availW = wrap.offsetWidth;
        var itemW  = brandItems[0].offsetWidth;
        /* (아이템너비 + gap) 단위로 몇 개 들어가는지 계산, 최소 1개 보장 */
        var count  = Math.floor((availW + BRAND_GAP) / (itemW + BRAND_GAP));
        return Math.max(1, Math.min(count, BRAND_VISIBLE));
      }

      function getMaxIndex() {
        return Math.max(0, getBrandLayoutItemCount() - getVisibleCount());
      }

      /* 래퍼 너비: 1920px(실제 7개가 모두 들어가는 경우)에서는 7개 기준 픽셀 고정,
         그보다 좁을 때는 flex:1 가용 너비를 그대로 사용 (style.width 초기화) */
      function setWrapWidth() {
        var wrap = brandTrack.parentElement;
        if (!wrap || !brandItems[0]) return;
        var itemW   = brandItems[0].offsetWidth;
        var maxW    = (itemW + BRAND_GAP) * BRAND_VISIBLE - BRAND_GAP; /* 7개 최대 너비 */
        var availW  = wrap.parentElement ? wrap.parentElement.offsetWidth : 9999;

        if (availW >= maxW + 1) {
          /* 1920px처럼 충분히 넓은 경우 → 기존 방식: 7개 딱 맞게 픽셀 고정 */
          wrap.style.width = maxW + 'px';
        } else {
          /* 1440px처럼 공간이 부족한 경우 → flex:1 가용 너비 활용 (강제 픽셀 해제) */
          wrap.style.width = '';
        }
        /* 인덱스가 새 maxIndex를 초과하지 않도록 보정 */
        if (brandIndex > getMaxIndex()) {
          moveBrand(getMaxIndex());
        }
      }

      function moveBrand(idx) {
        brandIndex = Math.max(0, Math.min(idx, getMaxIndex()));
        brandTrack.style.transform = 'translateX(-' + getBrandScrollOffsetPx(brandIndex) + 'px)';
      }

      function startBrandAuto() {
        clearInterval(brandTimer);
        if (brandPaused) return;
        brandTimer = setInterval(function () {
          var next = brandIndex + 1 > getMaxIndex() ? 0 : brandIndex + 1;
          moveBrand(next);
        }, 3000);
      }

      /* 버튼 이벤트 */
      if (brandPrev) {
        brandPrev.addEventListener('click', function () {
          moveBrand(brandIndex - 1);
          startBrandAuto();
        });
      }
      if (brandNext) {
        brandNext.addEventListener('click', function () {
          moveBrand(brandIndex + 1);
          startBrandAuto();
        });
      }
      if (brandPause) {
        brandPause.addEventListener('click', function () {
          brandPaused = !brandPaused;
          brandPause.setAttribute('aria-label', brandPaused ? '재생' : '일시정지');
          /* 재생/일시정지 아이콘 크기 일관성 유지 */
          brandPause.innerHTML = brandPaused ? '<span class="play-icon" aria-hidden="true">&#9654;</span>' : '<span class="pause-icon" aria-hidden="true"></span>';
          startBrandAuto();
        });
      }

      /* 초기화 — 렌더 후 너비 계산 (자동 루프는 뷰포트 진입 시 시작) */
      requestAnimationFrame(function () {
        setWrapWidth();
      });

      window.addEventListener('resize', setWrapWidth);

      /* ── 자동 전환: 섹션이 화면에 들어올 때만 시작 (Intersection Observer) ── */
      var brandSection = document.querySelector('.brand-products');
      if (brandSection && 'IntersectionObserver' in window) {
        var brandObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            var isEnter = entry.intersectionRatio >= 0.3;
            var isFullyOut = entry.intersectionRatio === 0;

            if (isEnter) {
              if (!pageScrollDetected) {
                brandPendingEnter = true;
                return; /* 최초 로드 직후 자동 시작 방지 */
              }
              if (!brandStartedOnce) {
                brandStartedOnce = true;
                moveBrand(0); /* 최초 진입 시 index 0부터 시작 */
              }
              startBrandAuto(); /* 재진입 시 현재 index 유지한 채 재개 */
            } else if (isFullyOut) {
              clearInterval(brandTimer); /* 섹션 완전 이탈 시 정지 */
            }
          });
        }, { threshold: [0, 0.3] });

        brandObserver.observe(brandSection);

        window.addEventListener('withus:firstscroll', function () {
          if (!brandPendingEnter) return;
          brandPendingEnter = false;
          if (!brandStartedOnce) {
            brandStartedOnce = true;
            moveBrand(0);
          }
          startBrandAuto();
        });
      } else if (brandTrack) {
        /* IntersectionObserver 미지원 브라우저 fallback */
        window.addEventListener('scroll', function () {
          if (!brandStartedOnce) {
            brandStartedOnce = true;
            moveBrand(0);
          }
          startBrandAuto();
        }, { passive: true, once: true });
      }
    }
  })();
