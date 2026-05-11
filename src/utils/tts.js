// 브라우저 내장 TTS — 한국어 여성 보이스 우선 선택
// 무료, 별도 API 키 불필요

let voices = [];
let preferredVoice = null;

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  // 한국어 여성 보이스 우선 (Yuna, Sora, Heami 등)
  preferredVoice =
    voices.find((v) => /ko/i.test(v.lang) && /female|yuna|sora|heami/i.test(v.name)) ||
    voices.find((v) => /ko/i.test(v.lang)) ||
    null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function speak(text, opts = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  // 진행 중인 발화 취소 (중첩 방지)
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = opts.rate ?? 0.95;
  u.pitch = opts.pitch ?? 1.15; // 살짝 높여서 익살스럽게
  u.volume = opts.volume ?? 1;
  if (preferredVoice) u.voice = preferredVoice;
  if (opts.onend) u.onend = opts.onend;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// 순차 발화 (배열의 문장을 순서대로)
export function speakSequence(texts, gapMs = 400) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve();
  return new Promise((resolve) => {
    let i = 0;
    function next() {
      if (i >= texts.length) {
        resolve();
        return;
      }
      const t = texts[i++];
      speak(t, {
        onend: () => setTimeout(next, gapMs),
      });
    }
    next();
  });
}
