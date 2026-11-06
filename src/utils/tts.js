// 브라우저 내장 TTS — 아발론과 같은 목소리 고르기 (자연스러운 한국어 음성 우선: Yuna 등)

let voices = [];
let preferredVoice = null;
let ttsUnlocked = false;

const PREFER = ['natural', 'online', 'neural', 'premium', 'enhanced', 'yuna', 'sunhi', 'injoon', 'google 한국의'];
function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices() || [];
  const ko = voices.filter((v) => /^ko([-_]|$)/i.test(v.lang || ''));
  const score = (v) => {
    const n = (v.name || '').toLowerCase();
    const i = PREFER.findIndex((p) => n.includes(p));
    return (i < 0 ? 100 : i) - (/ko[-_]kr/i.test(v.lang) ? 0.5 : 0);
  };
  preferredVoice = ko.slice().sort((a, b) => score(a) - score(b))[0] || null;
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

// 문장마다 끊어서 읽기: 한 번에 읽히면 문장 사이 쉼 없이 붙어버려서
// 마침표·물음표·느낌표 뒤 0.45초, "5... 4..." 같은 말줄임 뒤 0.6초 쉼
let speakToken = 0;
function splitForSpeech(text) {
  const out = [];
  const re = /[^.?!…]+(?:\.{2,}|…|[.?!])?/g;
  let m;
  while ((m = re.exec(String(text)))) {
    const raw = m[0].trim();
    if (!raw) continue;
    const ellipsis = /(\.{2,}|…)$/.test(raw);
    const t = raw.replace(/(\.{2,}|…)$/, '').trim();
    if (!t) continue;
    out.push({ t, pause: ellipsis ? 600 : 450 });
  }
  return out.length ? out : [{ t: String(text), pause: 0 }];
}

export function speak(text, opts = {}) {
  if (!isTTSAvailable()) return;
  window.speechSynthesis.cancel();
  const token = ++speakToken;
  const parts = splitForSpeech(text);

  const say = (i) => {
    if (token !== speakToken) return; // 새 나레이션이 시작되면 이전 것은 멈춤
    if (i >= parts.length) {
      if (opts.onend) opts.onend();
      return;
    }
    const u = new SpeechSynthesisUtterance(parts[i].t);
    u.lang = (preferredVoice && preferredVoice.lang) || 'ko-KR';
    u.rate = opts.rate ?? 0.95;
    u.pitch = opts.pitch ?? 1.0;
    u.volume = opts.volume ?? 1;
    if (preferredVoice) u.voice = preferredVoice;
    // 아이폰 사파리는 onend가 가끔 안 와서 다음 문장이 멈출 수 있음 → 예상 길이가 지나면 다음으로
    let moved = false;
    const next = () => {
      if (moved) return;
      moved = true;
      clearTimeout(guard);
      setTimeout(() => say(i + 1), i < parts.length - 1 ? parts[i].pause : 0);
    };
    const guard = setTimeout(next, 900 + (parts[i].t.length * 190) / (u.rate || 1));
    u.onend = next;
    u.onerror = (e) => { if (opts.onerror) opts.onerror(e); };
    try {
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS speak failed:', e);
    }
  };
  setTimeout(() => say(0), 100);
}

export function stopSpeaking() {
  if (!isTTSAvailable()) return;
  speakToken++;
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
