// 브라우저 내장 TTS — 한국어 여성 보이스 우선 선택

let voices = [];
let preferredVoice = null;
let ttsUnlocked = false;

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices();
  preferredVoice =
    voices.find((v) => /ko/i.test(v.lang) && /female|yuna|sora|heami/i.test(v.name)) ||
    voices.find((v) => /ko/i.test(v.lang)) ||
    null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// 사용자 인터랙션으로 TTS 잠금 해제 (브라우저 자동재생 정책 회피)
export function unlockTTS() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (ttsUnlocked) return;
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    ttsUnlocked = true;
  } catch (e) {
    // ignore
  }
}

export function isTTSAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text, opts = {}) {
  if (!isTTSAvailable()) return;
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = opts.rate ?? 0.95;
  u.pitch = opts.pitch ?? 1.15;
  u.volume = opts.volume ?? 1;
  if (preferredVoice) u.voice = preferredVoice;
  if (opts.onend) u.onend = opts.onend;
  if (opts.onerror) u.onerror = opts.onerror;

  setTimeout(() => {
    try {
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS speak failed:', e);
    }
  }, 100);
}

export function stopSpeaking() {
  if (!isTTSAvailable()) return;
  window.speechSynthesis.cancel();
}

export function speakSequence(texts, gapMs = 400) {
  if (!isTTSAvailable()) return Promise.resolve();
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
