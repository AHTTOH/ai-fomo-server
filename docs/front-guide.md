핵심은 두 덩어리다.

* **웹의 바닥층** : 브라우저가 원래부터 이해하는 기본 재료
* **UI 만드는 층** : 화면을 더 빨리, 더 예쁘게 조립하는 공구

그리고 네가 헷갈린 단어부터 먼저 자른다.

## 1) 단어 뜻부터 잘라서 끝내기

| 단어            | 진짜 뜻              | 한 줄 번역                                                             | 공식 근거                                                                                                                                                                                                                                                            |
| --------------- | -------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 프로토콜        | 통신 규칙            | 브라우저와 서버가**어떤 형식으로 대화할지 정한 규칙**            | HTTP는 웹의 데이터 교환 기초이자 클라이언트-서버 프로토콜이다. ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview?utm_source=chatgpt.com "Overview of HTTP - MDN Web Docs"))                                                                |
| 런타임          | 실행 환경            | 코드가**실제로 돌아가는 무대**                                   | Node.js는 JavaScript runtime environment이고, 브라우저 쪽 JS 실행 모델도 별도 런타임 개념으로 설명된다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Glossary/Node.js?ref=pyxofy&utm_source=chatgpt.com "Node.js - Glossary - MDN Web Docs"))                   |
| 마크업 언어     | 구조를 표시하는 언어 | “이건 제목”, “이건 버튼”처럼**문서 의미/구조를 태그로 표시** | HTML은 웹의 마크업 언어이며 요소와 태그로 문서 구조를 만든다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/HTML?utm_source=chatgpt.com "HTML: HyperText Markup Language - MDN Web Docs"))                                                                   |
| 스타일시트 언어 | 꾸미는 규칙 언어     | “이 텍스트는 24px”, “이 박스는 파란색” 같은**표현 규칙**     | CSS는 문서의 표현 방식을 기술하는 stylesheet language다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/CSS?utm_source=chatgpt.com "CSS: Cascading Style Sheets - MDN Web Docs"))                                                                             |
| API             | 기능 창구            | “이 기능을 이렇게 불러 써라” 하는 인터페이스                         | MDN은 API를 복잡한 기능을 더 쉽게 쓰게 해주는 constructs로 설명한다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Introduction?utm_source=chatgpt.com "Introduction to web APIs - Learn web development |
| 패키지          | 설치 단위            | `npm install`하는**코드 묶음**                                 | npm package는 package.json으로 설명되는 파일/디렉터리 단위다. ([TypeScript](https://www.typescriptlang.org/?utm_source=chatgpt.com "TypeScript: JavaScript With Syntax For Types."))                                                                                       |

---

## 2) 웹의 바닥층 — 이건 “없으면 웹이 성립이 안 되는” 층

여기 있는 것들은 **구닥다리**가 아니라 **기초체력**이다.
특히 **HTML / CSS / JavaScript / DOM / HTTP**는 지금도 웹의 중심이다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works?utm_source=chatgpt.com "How the web works - Learn web development - MDN Web Docs"))

| 용어            | 정체                    | 쉽게 말하면                                                                  | 바이브코딩에서 이렇게 말하면 됨                 | 공식 문서 / 예시                                                                                                                                                                        |
| --------------- | ----------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP            | 프로토콜                | 브라우저가 서버에 “페이지 줘”, “데이터 줘” 요청하는 규칙                 | “HTTP API로 데이터 가져와서 렌더링해”         | 개요 ([MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview?utm_source=chatgpt.com "Overview of HTTP - MDN Web Docs"))                                             |
| HTML            | 마크업 언어             | 웹페이지**뼈대** . 제목, 버튼, 입력창, 표 같은 구조                    | “시맨틱한 HTML 구조로 짜”                     | 문서 / 요소 목록 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/HTML?utm_source=chatgpt.com "HTML: HyperText Markup Language - MDN Web Docs"))                                   |
| CSS             | 스타일시트 언어         | 웹페이지**꾸미기** . 색, 여백, 정렬, 반응형                            | “깔끔한 spacing, card, responsive CSS 적용해” | 문서 / 문법 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/CSS?utm_source=chatgpt.com "CSS: Cascading Style Sheets - MDN Web Docs"))                                             |
| JavaScript      | 프로그래밍 언어         | 클릭 반응, 상태 변경, 데이터 요청, 애니메이션                                | “클릭 시 drawer 열고 fetch 후 UI 갱신해”      | 문서 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/JavaScript?utm_source=chatgpt.com "JavaScript - MDN Web Docs - Mozilla"))                                                    |
| TypeScript      | 프로그래밍 언어         | JS에 타입을 붙여서 큰 프로젝트를 덜 망하게 함                                | “TypeScript로 타입 안전하게 짜”               | 소개 / 문서 ([TypeScript](https://www.typescriptlang.org/?utm_source=chatgpt.com "TypeScript: JavaScript With Syntax For Types."))                                                            |
| DOM             | 문서 객체 모델          | HTML이 브라우저 안에서**트리 구조 객체**가 된 상태                     | “DOM 직접 조작 최소화하고 컴포넌트로 관리해”  | 문서 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model?utm_source=chatgpt.com "Document Object Model (DOM) - Web APIs - MDN Web Docs"))                   |
| Web APIs        | 브라우저 내장 기능 묶음 | 브라우저가 기본 제공하는 기능.`fetch`,`Canvas`,`localStorage`같은 것들 | “브라우저 기본 Web APIs만 써서 구현해”        | 목록 / 소개 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/API?utm_source=chatgpt.com "Web APIs - MDN Web Docs"))                                                                |
| Fetch API       | 브라우저 API            | 서버에서 JSON 같은 데이터 받아오는 표준 방식                                 | “fetch로 API 호출해”                          | 문서 / 사용법 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API?utm_source=chatgpt.com "Fetch API - MDN Web Docs"))                                                   |
| Canvas          | HTML 요소 + Web API     | 픽셀 기반 2D 드로잉. 간단한 게임, 차트, 파티클 가능                          | “canvas로 배경 파티클 만들어”                 | 튜토리얼 / 기본 예시 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial?utm_source=chatgpt.com "Canvas tutorial - Web APIs                             |
| SVG             | 벡터 그래픽 마크업      | 선명한 아이콘, 로고, 간단한 도형/선 애니메이션에 강함                        | “SVG로 선형 아이콘, 로고 애니메이션 넣어”     | 소개 / 튜토리얼 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/SVG?utm_source=chatgpt.com "SVG: Scalable Vector Graphics - MDN Web Docs"))                                       |
| WebGL           | 브라우저 그래픽 API     | GPU 써서 2D/3D 고성능 그래픽 그리는 저수준 API                               | “WebGL 기반 3D 배경 넣어”                     | 문서 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API?utm_source=chatgpt.com "WebGL: 2D and 3D graphics for the web - Web APIs                                 |
| 브라우저 런타임 | 실행 환경               | JS가 크롬 같은 브라우저 안에서 돌면서 DOM, fetch 같은 걸 쓸 수 있는 무대     | “브라우저 런타임에서만 동작하게 해”           | JS 실행 모델 / Web APIs ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model?utm_source=chatgpt.com "JavaScript execution model - MDN Web Docs")) |
| Node.js         | 런타임                  | JS를 브라우저 밖, 서버나 CLI에서 돌리는 무대                                 | “Node 기반 프로젝트로 세팅해”                 | 문서 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Glossary/Node.js?ref=pyxofy&utm_source=chatgpt.com "Node.js - Glossary - MDN Web Docs"))                                         |

### 여기서 바로 잡아야 할 감각

* **HTML**은 낡은 게 아니라 웹의 **문서 구조 본체**다. React도 결국 내부적으로는 HTML 요소를 기반으로 UI를 만든다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/HTML?utm_source=chatgpt.com "HTML: HyperText Markup Language - MDN Web Docs"))
* **CSS**도 안 사라진다. Tailwind를 써도 결국 CSS 개념 위에서 도는 거다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/CSS?utm_source=chatgpt.com "CSS: Cascading Style Sheets - MDN Web Docs"))
* **JavaScript**는 웹에서 동작을 넣는 기본 엔진이고, Node.js 덕분에 서버 쪽도 JS로 할 수 있다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/JavaScript?utm_source=chatgpt.com "JavaScript - MDN Web Docs - Mozilla"))

---

## 3) UI 만드는 층 — 네가 앞으로 프롬프트에 넣을 단어들

이 층은 **“기초 위에 올리는 공구”**다.
여기서부터가 네가 말한 “좀 예쁘게”, “SaaS스럽게”, “별자리 느낌으로”를 지시하는 영역이다. ([React](https://react.dev/?utm_source=chatgpt.com "React"))

| 용어              | 정체                           | 쉽게 말하면                                                   | 언제 말하면 좋은가                               | 공식 문서 / 예시                                                                                                                                               |
| ----------------- | ------------------------------ | ------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React             | JavaScript UI 라이브러리       | 화면을 컴포넌트 단위로 쪼개서 만드는 표준급 도구              | “React로 컴포넌트 구조 깔끔하게 짜”            | 소개 / Quick Start / 첫 컴포넌트 ([React](https://react.dev/?utm_source=chatgpt.com "React"))                                                                        |
| Next.js           | React 프레임워크               | React 앱을 더 완성형 웹앱처럼 만드는 틀                       | “Next.js로 앱 라우팅/서버 렌더링 포함해”       | 대시보드 학습 예시 ([Next.js](https://nextjs.org/learn?utm_source=chatgpt.com "Learn Next.js                                                                   |
| Tailwind CSS      | CSS 프레임워크                 | 작은 클래스 조합으로 빠르게 예쁜 UI를 만듦                    | “Tailwind로 modern SaaS UI 스타일 적용해”      | 소개 / utility 예시 ([Tailwind CSS](https://tailwindcss.com/?utm_source=chatgpt.com "Tailwind CSS - Rapidly build modern websites without ever ..."))                |
| shadcn/ui         | 컴포넌트 세트 + 코드 배포 방식 | 바로 가져다 쓸 수 있는 예쁜 컴포넌트 뼈대                     | “shadcn/ui 느낌의 깔끔한 관리화면”             | 소개 / 대시보드 예시 / 컴포넌트 목록 ([Shadcn](https://ui.shadcn.com/docs?utm_source=chatgpt.com "Introduction - Shadcn UI"))                                        |
| Radix UI          | 저수준 UI 컴포넌트 라이브러리  | 접근성 좋은 기본 부품. 탭, 다이얼로그, 메뉴 같은 뼈대         | “접근성 좋은 dialog/tabs/navigation 써”        | 소개 / Tabs / Navigation Menu ([Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction?utm_source=chatgpt.com "Introduction – Radix Primitives")) |
| Motion            | 애니메이션 라이브러리          | React 요소에 부드러운 등장, hover, layout animation 넣기 좋음 | “Motion으로 고급스러운 전환 넣어”              | 소개 / motion component / examples ([Motion](https://motion.dev/?utm_source=chatgpt.com "Motion — JavaScript &amp; React animation library"))                           |
| three.js          | JavaScript 3D 라이브러리       | 별자리, 우주, 입자, 3D 오브젝트, 카메라 움직임                | “three.js로 배경에 우주/별자리/입자 연출 넣어” | 공식 examples ([threejs.org](https://threejs.org/examples/?utm_source=chatgpt.com "Examples"))                                                                       |
| React Three Fiber | React renderer for three.js    | three.js를 React 문법으로 더 쉽게 다루게 해줌                 | “React 프로젝트 안에서 3D 배경은 r3f로 짜”     | 소개 / 첫 장면 / examples ([Poimandres Documentation](https://r3f.docs.pmnd.rs/?utm_source=chatgpt.com "React Three Fiber: Introduction"))                           |
| TanStack Table    | headless UI 라이브러리         | 강력한 데이터 테이블 엔진. 정렬/필터/고정열/페이지네이션      | “고급 데이터그리드 넣어”                       | 소개 / 컬럼 가이드 ([TanStack](https://tanstack.com/table/latest/docs?utm_source=chatgpt.com "Introduction                                                     |
| Lucide            | 아이콘 세트                    | 깔끔한 SVG 아이콘 모음                                        | “Lucide 아이콘으로 통일해”                     | 아이콘 목록 / 소개 ([Lucide](https://lucide.dev/icons/?utm_source=chatgpt.com "Icons"))                                                                              |
| Zustand           | 상태관리 라이브러리            | 필터값, 모달 열림, 선택 행 같은 전역 상태를 가볍게 관리       | “간단한 전역 상태는 Zustand로”                 | 소개 ([Zustand](https://zustand.docs.pmnd.rs/?utm_source=chatgpt.com "Zustand: Introduction"))                                                                       |

---

## 4) 네가 진짜 프롬프트에 넣어야 하는 핵심 조합

### A. “예쁜 SaaS 대시보드”

이럴 때는 보통 이 단어들이 먹힌다.

* **React**
* **Tailwind CSS**
* **shadcn/ui**
* **Lucide icons**
* **Motion**
* **TanStack Table**

이 조합은 “관리툴”, “사내 대시보드”, “설정 페이지”, “CRM/ATS 같은 화면”에 잘 맞는다. React는 컴포넌트 UI, Tailwind는 빠른 스타일링, shadcn/ui는 바로 쓸 수 있는 예쁜 컴포넌트, Motion은 부드러운 연출, TanStack Table은 강한 표 기능을 맡는다. ([React](https://react.dev/?utm_source=chatgpt.com "React"))

프롬프트 예시:

> React + Tailwind + shadcn/ui 기반의 modern SaaS dashboard로 만들어.
> Lucide 아이콘 사용.
> 카드/테이블/필터/모달은 shadcn 스타일.
> hover, page transition, section reveal은 Motion으로 고급스럽게 넣어.

### B. “우주/별자리/입자 배경”

이럴 때는 이 단어들이 핵심이다.

* **three.js**
* **React Three Fiber**
* **Canvas**
* **WebGL**
* **Motion** (UI 전환용)

three.js는 3D 그래픽 엔진 쪽, React Three Fiber는 그걸 React 안에서 쓰기 쉽게 만든 층이다. Canvas/WebGL은 더 바닥에 있는 기술 이름이다. ([threejs.org](https://threejs.org/examples/?utm_source=chatgpt.com "Examples"))

프롬프트 예시:

> hero 섹션 배경에 three.js 또는 @react-three/fiber를 사용해서
> 별자리 선 연결, 은은한 파티클, 마우스 따라 움직이는 depth 효과를 넣어.
> 본문 UI는 React + Tailwind로 깔끔하게 유지하고, 텍스트 가독성은 해치지 마.

### C. “고급 테이블/관리화면”

이럴 때는:

* **TanStack Table**
* **shadcn/ui**
* **Zustand**
* **Radix UI**

TanStack Table은 표 로직, shadcn/ui는 겉 UI, Zustand는 상태, Radix는 접근성 좋은 기본 상호작용 부품으로 이해하면 된다. shadcn/ui 공식 Data Table 문서도 TanStack Table과 `<Table />` 컴포넌트를 같이 사용해 커스텀 데이터 테이블을 만드는 가이드를 제공한다. ([Shadcn](https://ui.shadcn.com/docs/components/radix/data-table?utm_source=chatgpt.com "Data Table - Shadcn UI"))

---

## 5) 네가 보면 좋은 “공식 예시 링크” 모음

아래는 그냥 북마크해도 된다.

* **HTML 요소 사전** : 어떤 태그가 있는지 전체 보기 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements?utm_source=chatgpt.com "HTML elements reference - MDN Web Docs"))
* **CSS 레퍼런스** : CSS 속성 전체 보기 ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference?utm_source=chatgpt.com "CSS reference - MDN Web Docs"))
* **React Quick Start / 첫 컴포넌트** : React 감 잡기 ([React](https://react.dev/learn?utm_source=chatgpt.com "Quick Start"))
* **Tailwind utility 예시** : 클래스 조합 감 잡기 ([Tailwind CSS](https://tailwindcss.com/docs/styling-with-utility-classes?utm_source=chatgpt.com "Styling with utility classes - Core concepts"))
* **shadcn/ui Examples - Dashboard** : “요즘 예쁜 관리화면” 바로 보기 ([Shadcn](https://ui.shadcn.com/examples/dashboard?utm_source=chatgpt.com "The Foundation for your Design System - Shadcn UI"))
* **Motion examples** : 인터랙션/전환 모음 ([Motion](https://motion.dev/examples?utm_source=chatgpt.com "Official Motion Examples | React, JS &amp; Vue Animations"))
* **three.js examples** : 별, 3D, 카메라, 셰이더, 입자 예제 다 있음 ([threejs.org](https://threejs.org/examples/?utm_source=chatgpt.com "Examples"))
* **React Three Fiber examples** : React 안에서 3D 만드는 예시 ([Poimandres Documentation](https://r3f.docs.pmnd.rs/getting-started/examples?utm_source=chatgpt.com "Examples - Introduction - React Three Fiber"))
* **TanStack Table docs** : 고급 표 기능 감 잡기 ([TanStack](https://tanstack.com/table/latest/docs?utm_source=chatgpt.com "Introduction | TanStack Table Docs"))
* **Radix Tabs / Navigation Menu** : “상호작용 부품” 감 잡기 ([Radix UI](https://www.radix-ui.com/primitives/docs/components/tabs?utm_source=chatgpt.com "Tabs – Radix Primitives"))
* **Lucide icons** : 아이콘 둘러보기 ([Lucide](https://lucide.dev/icons/?utm_source=chatgpt.com "Icons"))

---

## 6) 마지막으로, 네 기준에서 이렇게만 구분하면 된다

### 절대 안 사라지는 것

* HTTP
* HTML
* CSS
* JavaScript
* DOM
* Web APIs

이건 **웹의 본체**다. ([MDN 웹 문서](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview?utm_source=chatgpt.com "Overview of HTTP - MDN Web Docs"))

### 지금 예쁜 프론트에서 자주 쓰는 것

* React
* Tailwind CSS
* shadcn/ui
* Motion
* three.js / React Three Fiber
* TanStack Table
* Lucide
* Zustand

이건 **웹을 더 빨리, 더 보기 좋게 만드는 현대식 공구**다. ([React](https://react.dev/?utm_source=chatgpt.com "React"))
