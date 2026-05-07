# Cursor 공통 요청 프롬프트 v2
> Kombai 출력 코드 수령 직후, 매 페이지 작업 시작 전 Cursor에 이 내용 전체를 붙여넣고 시작할 것.

---

## 🔒 작업 전 필수 선언

아래 규칙은 이 프로젝트 전체에 적용되는 절대 기준이다.
코드 수정 전 반드시 기존 코드 전체 맥락을 분석한 뒤 작업할 것.
분석 결과를 먼저 보고하고, 컨펌 후 코드를 출력할 것.

---

## 1. 헤더 / 푸터

- 헤더·푸터 HTML 코드를 **각 페이지 파일에 직접 삽입**한다. (fetch include 방식 사용 금지)
- 모든 페이지의 헤더·푸터 코드는 **100% 동일**해야 한다.
- 헤더 구조: `<header class="header">` 안에 로고 + `<nav class="gnb">` 포함.
- 푸터 구조: `<footer class="footer">` 시맨틱 태그 사용.
- 헤더·푸터에는 **애니메이션 일절 적용 금지**.

---

## 2. GNB 활성화 (메인 + 전 서브페이지 공통)

- 현재 페이지에 해당하는 GNB 항목에 `is-active` 클래스를 자동 부여한다.
- 서브페이지가 있는 경우, 부모 메뉴와 해당 서브 메뉴 항목 **모두** `is-active` 처리.
- 판단 기준은 `window.location.pathname`. 하드코딩 금지.
- Null check 필수.

### 📁 페이지 파일 목록 (매 프로젝트마다 아래 표를 채워서 Cursor에 전달)

> 아래 표를 실제 생성된 파일명으로 채운 뒤 Cursor에 붙여넣을 것.
> Cursor는 이 표를 기준으로 GNB href를 자동 매핑한다.

```
[파일 목록 — 작업 시작 전 직접 입력]

| GNB 메뉴명 | 서브 메뉴명 | 파일명 |
|---|---|---|
| 홈 | — | index.html |
| 회사소개 | 회사개요 | about.html |
| 회사소개 | 핵심가치 | core-values.html |
| 회사소개 | 연혁 | history.html |
| 회사소개 | 오시는 길 | directions.html |
| 브랜드소개 | 주력브랜드 | brand.html |
| 브랜드소개 | 스페셜브랜드 | special-brand.html |
| 연구개발 | — | rd.html |
| 채용정보 | 채용정보 목록 | recruitment.html |
| 채용정보 | 채용정보 상세 | recruitment-detail.html |
| 고객센터 | — | contact.html |
```

위 파일 목록을 기준으로 GNB HTML 구조를 아래 패턴으로 잡아줘.
파일명과 href가 정확히 일치해야 한다.

```html
<nav class="gnb">
  <ul class="gnb__list">
    <li class="gnb__item">
      <a href="./about.html" class="gnb__link">회사소개</a>
      <ul class="sub-menu">
        <li class="sub-menu__item">
          <a href="./about.html" class="sub-menu__link">회사개요</a>
        </li>
        <li class="sub-menu__item">
          <a href="./about-history.html" class="sub-menu__link">연혁</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

```javascript
// GNB 자동 활성화
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  document.querySelectorAll('.gnb__link, .sub-menu__link').forEach(link => {
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;

    // 현재 경로와 일치하거나 하위 경로에 포함되면 활성화
    if (currentPath === href || currentPath.startsWith(href.replace('index.html', ''))) {
      link.classList.add('is-active');

      // 서브메뉴인 경우 부모 GNB도 활성화
      const parentGnb = link.closest('.gnb__item');
      if (parentGnb) {
        const parentLink = parentGnb.querySelector('.gnb__link');
        if (parentLink) parentLink.classList.add('is-active');
      }
    }
  });
});
```

---

## 3. 플로팅 배너

- 플로팅 배너는 **전 페이지 동일**하게 적용.
- 각 HTML 파일 `</body>` 직전에 동일한 코드 삽입.
- 스크롤 300px 이상 내려가면 노출, 최상단(0px)이면 숨김.
- 애니메이션은 반드시 `opacity` + `transform`만 사용. `top / left` 값 변경 절대 금지.
- Null check 필수.

```html
<!-- 플로팅 배너 -->
<aside class="floating-banner" aria-label="빠른 문의">
  <a href="#" class="floating-banner__link">
    <img src="./assets/icon-floating.svg" alt="문의하기" width="56" height="56">
  </a>
</aside>
```

```css
.floating-banner {
  position: fixed;
  bottom: var(--floating-bottom, 40px);
  right: var(--floating-right, 40px);
  opacity: 0;
  transform: translateY(12px);
  transition: opacity var(--transition-base), transform var(--transition-base);
  pointer-events: none;
  z-index: 900;
}
.floating-banner.is-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
```

```javascript
// 플로팅 배너 스크롤 제어
const floatingBanner = document.querySelector('.floating-banner');

if (floatingBanner) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      floatingBanner.classList.add('is-visible');
    } else {
      floatingBanner.classList.remove('is-visible');
    }
  }, { passive: true });
}
```

---

## 4. 섹션 간격 (전 페이지 공통)

- 모든 페이지의 섹션 간 `margin-top`을 아래 기준으로 통일.
- 하드코딩 금지. 반드시 아래 CSS 클래스 규칙으로만 처리.
- Kombai가 생성한 임의 `margin` 값이 있다면 이 규칙으로 덮어쓸 것.

```css
/* 섹션 간격 — 전 페이지 공통 */
.section + .section {
  margin-top: 160px;
}

@media (max-width: 1024px) {
  .section + .section {
    margin-top: 80px;
  }
}
```

| 브레이크포인트 | 섹션 간격 |
|---|---|
| 1024px 초과 | `160px` |
| 1024px 이하 | `80px` |

---

## 5. 이미지 처리

- 모든 이미지 경로는 `./assets/` 기준으로 통일.
- 파일명은 **영문 소문자 + 하이픈** 조합. 공백·한글·특수문자 금지.
  예: `hero-banner.webp`, `product-detail-01.webp`
- 아래 기준에 따라 `<img>` 속성 일괄 정리:

```html
<!-- LCP 대상 (각 페이지 최상단 히어로 이미지 1장만) -->
<img
  src="./assets/hero-banner.webp"
  alt="[구체적인 대체 텍스트]"
  width="1920"
  height="800"
  fetchpriority="high"
>

<!-- 일반 이미지 -->
<img
  src="./assets/product-main.webp"
  alt="[구체적인 대체 텍스트]"
  width="800"
  height="600"
  loading="lazy"
>
```

- `alt` 속성은 빈 값(`alt=""`) 절대 금지. 이미지 내용을 구체적으로 기술.
- `width` / `height` 명시 필수 (CLS 방지).

---

## 6. CSS 기본 변수 선언 (`:root`)

- 아래 변수가 `:root`에 선언되어 있는지 확인하고, 없으면 추가.
- 색상·폰트 변수는 **프로젝트 가이드 수령 전까지 선언 금지**.

```css
:root {
  /* 간격 */
  --spacing-unit: 8px;
  --section-gap: 160px;
  --section-gap-md: 80px;

  /* 형태 */
  --radius-card: 12px;

  /* 전환 */
  --transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* 플로팅 위치 */
  --floating-bottom: 40px;
  --floating-right: 40px;
}
```

---

## 7. 코드 품질 공통 규칙

- **인라인 스타일(`style=""`) 전면 금지**. 발견 즉시 외부 클래스로 전환.
- **시맨틱 태그 우선**: `<div>` 사용 전 `header / nav / main / section / article / footer / aside` 검토.
- **Null check 필수**: JS에서 DOM 조작 전 항상 존재 여부 확인.
- **2회 이상 반복 수치**: 즉시 CSS 변수 또는 JS 상수로 선언.
- **애니메이션**: `transform`, `opacity`만 사용. `top / left / width / height` 변경 절대 금지.
- **반응형 브레이크포인트**: 320 / 768 / 1024 / 1440px 기준 준수.
- **유동적 타이포그래피**: 고정 `px` 대신 `clamp()` 사용.
  예: `font-size: clamp(1rem, 2.5vw, 1.5rem);`
- **BEM 명명**: `Block__Element--Modifier` 규칙 엄격 준수.
- **주석**: 모든 주석은 한국어로, 유지보수 담당자 관점에서 작성.

---

## 8. 전체 링크 점검 (전 페이지 공통)

> 페이지 작업 완료 후 또는 전체 작업 마무리 시 반드시 수행.
> `@페이지_파일목록.md` 기준으로 아래 6가지 링크를 전부 점검하고 수정할 것.

### 점검 항목

**① GNB 링크**
- 모든 페이지 GNB의 href가 파일목록과 일치하는지 확인
- 서브메뉴 드롭다운 href 포함

**② GNB 서브메뉴 링크**
- 드롭다운 내 각 서브메뉴 href가 파일목록과 일치하는지 확인

**③ 서브페이지 탭메뉴 링크**
- 회사소개 4개 페이지(about / core-values / history / directions) 내 탭 href 일치 여부
- 탭이 있는 4개 파일 모두 동일한 탭 구조인지 확인

**④ 브레드크럼 링크**
- 각 서브페이지 브레드크럼의 홈(index.html) 링크 및 상위 메뉴 링크 확인

**⑤ 푸터 내 링크**
- footer-nav의 모든 href가 파일목록과 일치하는지 확인
- 개인정보처리방침 / 이용약관 등 별도 링크 포함

**⑥ 페이지 내 링크**
- 채용정보 목록(recruitment.html) → 상세(recruitment-detail.html) 연결 여부
- 기타 페이지 내 CTA 버튼 링크 확인

### 링크 점검 요청 프롬프트
```
@_rules/페이지_파일목록.md

파일목록 기준으로 전체 HTML 파일의 아래 링크를 모두 점검하고 수정해줘.

1. GNB + 서브메뉴 드롭다운 href
2. 서브페이지 탭메뉴 href (회사소개 4개 페이지)
3. 브레드크럼 href (홈 + 상위메뉴)
4. 푸터 내 모든 링크 href
5. 페이지 내 CTA / 목록→상세 연결 링크

수정 전 파일별로 문제 발견된 항목 먼저 보고하고, 컨펌 후 일괄 수정할 것.
```

---

## ✅ 작업 완료 후 체크리스트 보고 요청

```
작업 완료 후 아래 항목을 체크리스트 형식으로 보고해줘.
미완료 항목은 이유와 함께 명시할 것.

[ ] 헤더·푸터 코드 각 페이지 직접 삽입 및 동일 여부
[ ] GNB 파일 목록 기준 href 매핑 완료
[ ] GNB 서브메뉴 드롭다운 href 매핑 완료
[ ] GNB is-active 자동 활성화 로직 적용 (메인 + 서브 포함)
[ ] 서브페이지 탭메뉴 href 매핑 완료 (회사소개 4개 페이지)
[ ] 브레드크럼 링크 확인
[ ] 푸터 내 링크 href 확인
[ ] 페이지 내 CTA / 목록→상세 링크 확인
[ ] 플로팅 배너 전 페이지 동일 삽입 및 스크롤 제어 동작
[ ] 섹션 간격 160px / 80px 규칙 적용 (하드코딩 없음)
[ ] 이미지 파일명 영문 소문자·하이픈 정리
[ ] LCP 이미지 fetchpriority="high" 적용 (페이지당 1장)
[ ] 일반 이미지 loading="lazy" + width/height 명시
[ ] alt 속성 구체적 기술 (빈 값 없음)
[ ] 인라인 스타일 잔존 여부 (없어야 함)
[ ] 하드코딩 색상·수치 잔존 여부 (없어야 함)
[ ] Null check 누락 여부 (없어야 함)
[ ] BEM 명명 규칙 준수 여부
[ ] :root 변수 선언 완료 여부
```
