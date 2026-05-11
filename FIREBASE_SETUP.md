# 🔥 Firebase 설정 가이드

이 프로젝트는 Firebase Realtime Database와 Anonymous Auth를 사용합니다.
처음부터 끝까지 따라가시면 됩니다. **무료 플랜으로 충분합니다.**

---

## 1단계. Firebase 프로젝트 만들기

### 1-1. 콘솔 접속
[Firebase 콘솔](https://console.firebase.google.com)에 Google 계정으로 로그인.

### 1-2. 프로젝트 생성
- **"프로젝트 추가"** 클릭
- 프로젝트 이름 입력 (예: `cheese-thief`)
- Google Analytics는 **비활성화** 권장 (불필요)
- "프로젝트 만들기" 클릭, 잠시 대기

---

## 2단계. 웹 앱 등록

### 2-1. 웹 앱 추가
- 프로젝트 개요 화면에서 **`</>`** (웹) 아이콘 클릭
- 앱 닉네임: `cheese-thief-web` (자유)
- Firebase Hosting은 **체크 안 함** (Vercel 사용)
- "앱 등록" 클릭

### 2-2. 구성 정보 복사 (중요!)
다음과 같은 코드가 나타납니다:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "cheese-thief.firebaseapp.com",
  databaseURL: "https://cheese-thief-default-rtdb.firebaseio.com",
  projectId: "cheese-thief",
  storageBucket: "cheese-thief.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc..."
};
```

이 값들을 프로젝트 루트의 `.env` 파일에 옮겨야 합니다. (다음 단계)

---

## 3단계. .env 파일 만들기

프로젝트 루트에서:

```bash
cp .env.example .env
```

`.env`를 열어서 위에서 복사한 값들을 채웁니다:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=cheese-thief.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://cheese-thief-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=cheese-thief
VITE_FIREBASE_STORAGE_BUCKET=cheese-thief.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc...
```

> ⚠️ **주의**: `.env` 파일은 git에 커밋되지 않도록 `.gitignore`에 포함되어 있습니다.

---

## 4단계. Realtime Database 활성화

### 4-1. DB 생성
- 좌측 메뉴 → **"빌드"** → **"Realtime Database"**
- "데이터베이스 만들기" 클릭

### 4-2. 위치 선택
- 위치: **`asia-southeast1` (싱가포르)** 또는 **`europe-west1`** 추천
  - 한국 사용자는 싱가포르가 가장 빠릅니다
  - 한 번 정하면 변경 불가

### 4-3. 보안 규칙 시작 모드
- **"잠금 모드로 시작"** 선택 (다음 단계에서 규칙 작성)
- "사용 설정" 클릭

---

## 5단계. 보안 규칙 적용

### 5-1. 규칙 탭으로 이동
- Realtime Database → **"규칙"** 탭

### 5-2. 다음 규칙으로 교체

프로젝트 루트의 `firebase-rules.json` 파일 내용을 복사해서 붙여넣습니다:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "$roomCode.matches(/^[0-9]{4}$/)"
      }
    }
  }
}
```

### 5-3. 게시
"게시" 버튼 클릭.

### 5-4. 규칙 설명
- **`auth != null`**: 익명이라도 로그인된 사용자만 접근 가능
- **`$roomCode.matches(/^[0-9]{4}$/)`**: 방 코드는 4자리 숫자만 허용 (스팸 방지)

> 💡 **더 엄격한 규칙**이 필요하다면 호스트만 옵션 변경 가능, 본인만 자기 player 노드 수정 가능 등을 추가할 수 있지만, 게임 1회용 친목 도구이므로 위 정도면 충분합니다.

---

## 6단계. 익명 인증 활성화

### 6-1. Authentication 활성화
- 좌측 메뉴 → **"빌드"** → **"Authentication"**
- "시작하기" 클릭

### 6-2. 익명 제공업체 추가
- **"Sign-in method"** 탭
- **"익명"** 클릭
- 토글을 **사용 설정**으로 변경
- "저장" 클릭

---

## 7단계. 로컬 테스트

이제 모든 설정이 끝났습니다. 다음 명령어로 로컬에서 테스트:

```bash
npm install
npm run dev
```

브라우저로 `http://localhost:5173` 접속, 방 만들기 시도 → Firebase 콘솔의 Realtime Database 탭에서 `rooms/[4자리 코드]` 노드가 생성되는지 확인.

---

## 8단계. Vercel 환경변수 설정

배포 시에는 Vercel에도 같은 환경변수를 등록해야 합니다:

### 8-1. Vercel 대시보드
- 프로젝트 → **Settings** → **Environment Variables**

### 8-2. 변수 7개 추가
`.env` 파일의 각 줄을 그대로 등록:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | (값 입력) |
| `VITE_FIREBASE_AUTH_DOMAIN` | (값 입력) |
| `VITE_FIREBASE_DATABASE_URL` | (값 입력) |
| `VITE_FIREBASE_PROJECT_ID` | (값 입력) |
| `VITE_FIREBASE_STORAGE_BUCKET` | (값 입력) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (값 입력) |
| `VITE_FIREBASE_APP_ID` | (값 입력) |

각 변수는 **Production / Preview / Development** 모두 체크.

### 8-3. 재배포
환경변수 추가 후 **반드시 재배포**해야 적용됩니다.
- Deployments → 최근 배포 → "..." → **"Redeploy"**

---

## 9단계. 승인된 도메인 추가

Firebase Authentication이 Vercel 도메인에서 동작하려면 승인이 필요합니다:

- Firebase 콘솔 → Authentication → **"Settings"** 탭 → **"승인된 도메인"**
- "도메인 추가" → Vercel URL 입력 (예: `cheese-thief.vercel.app`)
- 저장

`localhost`는 기본 포함되어 있습니다.

---

## 🆘 문제 해결

### "Permission denied" 에러
- 보안 규칙이 적용됐는지 확인 (5단계)
- Authentication에서 익명 사용 설정이 됐는지 확인 (6단계)

### "Firebase: Error (auth/...)" 에러
- 승인된 도메인에 현재 URL이 등록됐는지 확인 (9단계)
- `.env`의 키 값이 정확한지 확인 (오타 주의)

### TTS 음성이 안 나옴
- iOS는 첫 사용자 인터랙션 후에만 음성 재생됨 (정상)
- 시스템 볼륨 확인
- iOS Settings → 손쉬운 사용 → 음성 콘텐츠 → 음성에서 한국어 음성 다운로드

### Realtime DB 데이터가 안 보임
- 같은 와이파이에 연결돼 있는지 확인
- 브라우저 콘솔에서 에러 메시지 확인
- Firebase 콘솔 → Realtime Database → 데이터 탭에서 실시간 변화 확인

---

## 💰 비용

이 프로젝트는 **완전히 무료**로 운영 가능합니다.

Firebase 무료 플랜 (Spark) 한도:
- Realtime Database: 100 동시 연결, 1GB 저장, 10GB 다운로드/월
- Authentication: 무제한

게임 1판 평균 데이터 사용량은 수 KB 수준이라 한도 걱정 안 해도 됩니다.

Vercel Hobby 플랜 한도:
- 100GB 대역폭/월
- 무제한 배포

이 정도면 친구들끼리 매일 해도 한도 안 찹니다.

---

## 🧹 정기 정리 (선택)

방 데이터가 무한히 쌓이는 게 부담스럽다면 Firebase Functions로 24시간 지난 방을 자동 삭제할 수 있습니다.
하지만 무료 플랜에서는 Functions가 제한적이라, 직접 콘솔에서 가끔 `rooms` 노드를 정리하는 게 간단합니다.

또는 다음과 같은 룰을 추가해서 `createdAt`이 오래된 방은 읽기/쓰기 자동 거부할 수도 있습니다:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": "auth != null && data.child('createdAt').val() > (now - 86400000)",
        ".write": "auth != null"
      }
    }
  }
}
```

(86400000ms = 24시간)
