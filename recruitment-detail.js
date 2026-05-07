/* ===========================================
   WITHUS HEALTHCARE — recruitment-detail.js
   채용정보 상세 — Supabase 연동 + 지원하기 모달
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
     URL 파라미터에서 id 추출
  ============================================ */
  var params = new URLSearchParams(window.location.search);
  var jobId  = params.get('id');

  if (!jobId) {
    window.location.href = 'recruitment.html';
    return;
  }

  /* ============================================
     공고 상세 로드
  ============================================ */
  async function loadJobDetail() {
    var { data: job, error } = await sb
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      window.location.href = 'recruitment.html';
      return;
    }

    // 페이지 제목
    document.title = job.title + ' | Withus Healthcare';

    // 공고 제목
    var titleEl = document.querySelector('.rcd-title');
    if (titleEl) titleEl.textContent = job.title;

    // 업로드 날짜
    var dateEl = document.querySelector('.rcd-date');
    if (dateEl) {
      var d = new Date(job.created_at);
      dateEl.textContent = '업로드: ' + d.getFullYear() + '년 ' +
        String(d.getMonth() + 1).padStart(2, '0') + '월 ' +
        String(d.getDate()).padStart(2, '0') + '일';
    }

    // 마감일 포맷
    var deadlineStr = '상시 채용';
    if (job.deadline) {
      var dl = new Date(job.deadline);
      deadlineStr = dl.getFullYear() + '.' +
        String(dl.getMonth() + 1).padStart(2, '0') + '.' +
        String(dl.getDate()).padStart(2, '0') + '\n오후 ' +
        String(dl.getHours()).padStart(2, '0') + ':' +
        String(dl.getMinutes()).padStart(2, '0');
    }

    // 사이드바 + 모바일카드 — data-field 속성으로 값 채우기
    document.querySelectorAll('[data-field="job_type"]').forEach(function (el) {
      el.textContent = job.job_type || '';
    });
    document.querySelectorAll('[data-field="hire_type"]').forEach(function (el) {
      el.textContent = job.hire_type || '일반채용';
    });
    document.querySelectorAll('[data-field="career"]').forEach(function (el) {
      el.textContent = job.career || '';
    });
    document.querySelectorAll('[data-field="deadline"]').forEach(function (el) {
      el.innerHTML = deadlineStr.replace('\n', '<br>');
    });

    // 콘텐츠 렌더링 — 단일 내용
    var body = document.querySelector('.rcd-body');
    if (body) {
      body.innerHTML = '';
      var bodyText = job.content && job.content.body;
      if (bodyText) {
        var div = document.createElement('div');
        div.className = 'rcd-block';
        div.innerHTML =
          '<p class="rcd-block__text">' +
            bodyText.replace(/\n/g, '<br>') +
          '</p>';
        body.appendChild(div);
      }
    }

    // 지원하기 버튼 처리
    var applyBtns = document.querySelectorAll('.rcd-apply-btn');
    if (job.status === 'closed') {
      applyBtns.forEach(function (btn) {
        btn.style.opacity        = '0.5';
        btn.style.pointerEvents  = 'none';
        btn.style.cursor         = 'not-allowed';
        var spanEl = btn.querySelector('span');
        if (spanEl) spanEl.textContent = '접수 마감';
      });
    } else {
      applyBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          openApplyModal(job);
        });
      });
    }

    // Scroll reveal
    initReveal();
  }

  /* ============================================
     SCROLL REVEAL
  ============================================ */
  function initReveal() {
    var blocks = document.querySelectorAll('.rcd-block');
    if (!('IntersectionObserver' in window)) {
      blocks.forEach(function (b) { b.classList.add('in-view'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

    blocks.forEach(function (block, idx) {
      block.style.transitionDelay = (idx * 0.06) + 's';
      obs.observe(block);
    });
  }

  /* ============================================
     지원하기 모달
  ============================================ */
  // 모달 HTML 동적 삽입
  var modalHtml = '' +
    '<div id="applyModalOverlay" style="' +
      'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:500;' +
      'display:flex;align-items:center;justify-content:center;padding:20px;' +
      'opacity:0;pointer-events:none;transition:opacity 0.2s;">' +
      '<div id="applyModal" style="' +
        'background:#fff;border-radius:20px;width:100%;max-width:520px;' +
        'padding:36px 36px 32px;box-shadow:0 8px 40px rgba(0,0,0,0.15);' +
        'transform:translateY(16px);transition:transform 0.2s;' +
        'max-height:90vh;overflow-y:auto;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">' +
          '<div>' +
            '<h2 id="applyModalTitle" style="font-size:20px;font-weight:700;color:#111827;letter-spacing:-0.5px;"></h2>' +
            '<p style="font-size:13px;color:#6b7280;margin-top:3px;">지원서를 작성해주세요.</p>' +
          '</div>' +
          '<button id="applyModalClose" style="width:32px;height:32px;border:none;background:none;cursor:pointer;font-size:20px;color:#9ca3af;border-radius:6px;">✕</button>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:14px;">' +
          '<div>' +
            '<label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">이름 <span style="color:#e81111">*</span></label>' +
            '<input id="applyName" type="text" placeholder="홍길동" style="width:100%;height:44px;border:1.5px solid #e5e7eb;border-radius:8px;padding:0 12px;font-family:inherit;font-size:14px;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'#0b579f\'" onblur="this.style.borderColor=\'#e5e7eb\'">' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">이메일 <span style="color:#e81111">*</span></label>' +
            '<input id="applyEmail" type="email" placeholder="example@email.com" style="width:100%;height:44px;border:1.5px solid #e5e7eb;border-radius:8px;padding:0 12px;font-family:inherit;font-size:14px;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'#0b579f\'" onblur="this.style.borderColor=\'#e5e7eb\'">' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">연락처</label>' +
            '<input id="applyPhone" type="tel" placeholder="010-0000-0000" style="width:100%;height:44px;border:1.5px solid #e5e7eb;border-radius:8px;padding:0 12px;font-family:inherit;font-size:14px;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor=\'#0b579f\'" onblur="this.style.borderColor=\'#e5e7eb\'">' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">이력서 첨부 <span style="font-weight:400;color:#9ca3af;">(PDF, Word)</span></label>' +
            '<input id="applyResume" type="file" accept=".pdf,.doc,.docx" style="width:100%;border:1.5px solid #e5e7eb;border-radius:8px;padding:10px 12px;font-family:inherit;font-size:13px;box-sizing:border-box;cursor:pointer;">' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">한 줄 소개 <span style="font-weight:400;color:#9ca3af;">(선택)</span></label>' +
            '<textarea id="applyMessage" placeholder="간단한 지원 동기나 자기소개를 입력해주세요." style="width:100%;min-height:90px;border:1.5px solid #e5e7eb;border-radius:8px;padding:10px 12px;font-family:inherit;font-size:14px;outline:none;resize:vertical;box-sizing:border-box;line-height:1.6;" onfocus="this.style.borderColor=\'#0b579f\'" onblur="this.style.borderColor=\'#e5e7eb\'"></textarea>' +
          '</div>' +
        '</div>' +
        '<p id="applyError" style="font-size:12px;color:#e81111;margin-top:10px;min-height:16px;"></p>' +
        '<div style="display:flex;gap:10px;margin-top:20px;">' +
          '<button id="applyCancelBtn" style="flex:1;height:50px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;font-family:inherit;font-size:14px;font-weight:500;color:#6b7280;cursor:pointer;">취소</button>' +
          '<button id="applySubmitBtn" style="flex:2;height:50px;border:none;border-radius:8px;background:linear-gradient(149.05deg,rgba(108,166,232,1) 34.31%,rgba(11,87,159,1) 113.26%);color:#fff;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:-0.3px;transition:opacity 0.2s;">지원하기</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  var overlay   = document.getElementById('applyModalOverlay');
  var modal     = document.getElementById('applyModal');
  var closeBtn  = document.getElementById('applyModalClose');
  var cancelBtn = document.getElementById('applyCancelBtn');
  var submitBtn = document.getElementById('applySubmitBtn');
  var errorEl   = document.getElementById('applyError');
  var currentJob = null;

  function openApplyModal(job) {
    currentJob = job;
    document.getElementById('applyModalTitle').textContent = job.title;
    document.getElementById('applyName').value    = '';
    document.getElementById('applyEmail').value   = '';
    document.getElementById('applyPhone').value   = '';
    document.getElementById('applyMessage').value = '';
    document.getElementById('applyResume').value  = '';
    errorEl.textContent = '';
    overlay.style.opacity        = '1';
    overlay.style.pointerEvents  = 'all';
    modal.style.transform        = 'translateY(0)';
    document.body.style.overflow = 'hidden';
  }

  function closeApplyModal() {
    overlay.style.opacity        = '0';
    overlay.style.pointerEvents  = 'none';
    modal.style.transform        = 'translateY(16px)';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeApplyModal);
  cancelBtn.addEventListener('click', closeApplyModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeApplyModal(); });

  submitBtn.addEventListener('click', async function () {
    var name    = document.getElementById('applyName').value.trim();
    var email   = document.getElementById('applyEmail').value.trim();
    var phone   = document.getElementById('applyPhone').value.trim();
    var message = document.getElementById('applyMessage').value.trim();
    var file    = document.getElementById('applyResume').files[0];

    errorEl.textContent = '';

    if (!name)  { errorEl.textContent = '이름을 입력해주세요.';   return; }
    if (!email) { errorEl.textContent = '이메일을 입력해주세요.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.textContent = '올바른 이메일 형식을 입력해주세요.';
      return;
    }

    submitBtn.disabled      = true;
    submitBtn.textContent   = '제출 중...';

    var resume_url = null;

    // 이력서 파일 업로드
    if (file) {
      var fileName   = jobId + '/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      var { data: uploaded, error: upErr } = await sb.storage
        .from('resumes')
        .upload(fileName, file);

      if (upErr) {
        errorEl.textContent = '파일 업로드 실패: ' + upErr.message;
        submitBtn.disabled  = false;
        submitBtn.textContent = '지원하기';
        return;
      }

      var { data: urlData } = sb.storage.from('resumes').getPublicUrl(fileName);
      resume_url = urlData.publicUrl;
    }

    // 지원서 DB 저장
    var { error: insertErr } = await sb.from('applications').insert([{
      job_id:     jobId,
      name:       name,
      email:      email,
      phone:      phone || null,
      resume_url: resume_url,
      message:    message || null
    }]);

    if (insertErr) {
      errorEl.textContent   = '제출 실패: ' + insertErr.message;
      submitBtn.disabled    = false;
      submitBtn.textContent = '지원하기';
      return;
    }

    // 성공
    closeApplyModal();
    showSuccessMessage();
  });

  function showSuccessMessage() {
    var toast = document.createElement('div');
    toast.style.cssText = '' +
      'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(10px);' +
      'background:#059669;color:#fff;padding:14px 28px;border-radius:10px;' +
      'font-size:15px;font-weight:600;z-index:600;' +
      'box-shadow:0 4px 20px rgba(5,150,105,0.3);' +
      'transition:opacity 0.3s,transform 0.3s;opacity:0;';
    toast.textContent = '지원이 완료되었습니다. 검토 후 연락드리겠습니다.';
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(function () {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(function () { toast.remove(); }, 300);
    }, 4000);
  }

  /* ============================================
     UTILS
  ============================================ */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── 초기 로드 ── */
  loadJobDetail();

})();
