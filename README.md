# 🧀 누가 치즈를 훔쳤을까? (Cheese Thief)

보드게임 "누가 치즈를 훔쳤을까?"의 모바일 웹 버전.
**모두 모여서 함께 하는 오프라인 추리 게임**으로, 폰은 진행 보조 도구 역할만 합니다.

- 4~10인 + 치즈 단말 1대 (전용 폰/태블릿)
- 시스템은 최소만 추적 (역할, 주사위, 치즈 도난 표시)
- 공범, 들춰보기, 투표, 승자 판정은 **모두 사람이 직접** 진행

---

## 🚀 빠른 시작

### 0. 사전 준비
- Node.js 18 이상
- Firebase 프로젝트 (자세한 설정은 [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) 참고)

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase 환경변수 설정

`.env.example`을 `.env`로 복사하고 Firebase 콘솔에서 받은 키로 채우기:

```bash
cp .env.example .env
```

`.env` 파일을 열어서 7개 값 모두 입력:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. 개발 서버 실행

```bash
npm run dev
```

같은 와이파이에 연결된 폰에서도 접속 가능 (`http://[내 IP]:5173`).

### 4. 프로덕션 빌드

```bash
npm run build
```

---

## 🌐 Vercel 배포

1. GitHub에 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. **Environment Variables**에 `.env`의 7개 값 모두 추가
4. Deploy

자동 배포 URL: `https://your-project.vercel.app`

배포 후 도메인을 원하면 Vercel 대시보드 → Settings → Domains에서 설정.

---

## 🎮 게임 방법

### 게임 시작

1. 한 명이 "방 만들기" → 방 코드(4자리)와 QR 생성
2. 다른 사람들은 QR을 스캔하거나 코드로 입장
3. **방장이 입장한 쥐 중 1명을 탭하여 "치즈 단말"로 지정** (그 폰은 진행 도우미가 됨, 테이블 중앙에 놓기)
4. (옵션) 트롤 쥐 / 추종자 룰 변형 토글
5. "게임 시작"

### 역할

- **잠꾸러기** (시민팀, 다수): 도둑을 찾아내세요
- **치즈 도둑** (1명): 들키지 않고 치즈 훔치기
- **트롤 쥐** (옵션, 1명): 의심을 자기에게 몰아 단독 승리

### 진행

- **밤**: 1~6시 차례로 호명. 본인 시간에만 행동
- **도둑**: 자기 시간에 깨면 화면 가운데 치즈를 탭
- **공범 만들기**: 같이 깬 잠꾸러기에게 손가락으로 지목 (오프라인)
- **들춰보기**: 본인 시간에 혼자 깼다면 옆 사람 폰을 두 번 탭해서 주사위 한 번 확인
- **낮**: 3분 토론 → "하나 둘 셋!" 손가락으로 도둑 지목

### 승리 조건

- **잠꾸러기**: 진짜 도둑 지목 성공
- **도둑 (+공범)**: 엉뚱한 쥐가 지목됨
- **트롤 쥐**: 자기가 도둑으로 지목당함

---

## 📂 프로젝트 구조

```
cheese-thief/
├── package.json              # 의존성 정의
├── vite.config.js            # Vite 빌드 설정
├── index.html                # HTML 진입점
├── .env.example              # 환경변수 템플릿
├── README.md                 # 본 문서
├── FIREBASE_SETUP.md         # Firebase 콘솔 설정 가이드
├── firebase-rules.json       # Realtime DB 보안 규칙
├── vercel.json               # Vercel 배포 설정
└── src/
    ├── main.jsx              # React 진입점
    ├── App.jsx               # 상태머신 + 라우팅
    ├── firebase/
    │   ├── config.js         # Firebase 초기화
    │   └── room.js           # 방 관리 (CRUD, 게임 흐름)
    ├── utils/
    │   ├── theme.js          # 디자인 토큰 (컬러, 폰트)
    │   ├── game.js           # 게임 상수, 역할 분배
    │   ├── storage.js        # localStorage 헬퍼
    │   └── tts.js            # Web Speech API (나레이션)
    ├── components/
    │   ├── MouseAvatar.jsx   # 쥐 아바타 (역할별 표정)
    │   ├── BigCheese.jsx     # 풀스크린 치즈
    │   ├── EmptyPlate.jsx    # 도난 후 빈 접시
    │   ├── WoodenCup.jsx     # 그루터기 컵 (잠든 화면)
    │   ├── Dice.jsx          # 1~6 주사위
    │   └── StarryNight.jsx   # 밤하늘 별
    └── screens/
        ├── Home.jsx          # 메인 화면 + 프로필 설정
        ├── JoinRoom.jsx      # 4자리 코드 입력
        ├── Lobby.jsx         # 방 코드/QR + 옵션
        ├── RoleReveal.jsx    # 역할 카드 확인
        ├── DiceRoll.jsx      # 주사위 굴리기
        ├── NightPhase.jsx    # 개인 폰 - 잠든 화면
        ├── CheeseTerminal.jsx# 중앙 폰 - 전체 게임 진행
        ├── Discussion.jsx    # 일반 플레이어 토론 타이머
        ├── GameOver.jsx      # 다시하기 / 로비 복귀
        └── RuleGuide.jsx     # 룰 설명 10페이지 슬라이드
```

---

## 🛠 기술 스택

| 항목 | 내용 |
|------|------|
| **프론트엔드** | React 18 + Vite 5 |
| **언어** | JavaScript (TypeScript 미사용) |
| **스타일** | Inline style (CSS-in-JS 라이브러리 없음) |
| **백엔드** | Firebase Realtime Database |
| **인증** | Firebase Anonymous Auth |
| **TTS** | Web Speech API (브라우저 내장, 무료) |
| **QR 코드** | qrcode (클라이언트 생성) |
| **배포** | GitHub → Vercel (자동) |

---

## 🎨 디자인 시스템

- **톤**: 따뜻한 동화풍 + 수채화
- **컬러**:
  - 크림 베이지 `#FAF3E3` (메인 배경)
  - 치즈 옐로우 `#F4D06F` (포인트)
  - 우드 브라운 `#D4956B`
  - 세이지 그린 `#9CAF88`
  - 미드나잇 `#2A2540` (밤 분위기)
  - 잉크 `#5C4A2A` (텍스트)
- **폰트**:
  - 본문: Gowun Dodum (Google Fonts)
  - 디스플레이: Gaegu (Google Fonts)
- **캐릭터**: 쥐 아바타 10가지 컬러 + 역할별 표정

---

## ⚠️ 알려진 제약사항

- TTS는 브라우저 내장 음성 사용 (한국어 여성 보이스 자동 선택)
  - iOS Safari/Chrome 모두 지원, 단 보이스 품질은 OS마다 차이
- 누군가 끊기면 그 판은 무효 처리 (그레이스 타이머 없음)
- 시스템은 **공범/들춰보기/투표 결과/승자**를 추적하지 않음 (의도된 디자인)

---

## 📄 라이선스

원작 보드게임 IP에 대한 권리는 원작자에게 있습니다.
본 프로젝트는 비상업적 용도로만 사용하세요.
