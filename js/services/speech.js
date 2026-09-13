/**
 * Web Speech API 播放器（Service Layer）
 *
 * 稳定性设计（踩坑经验）：
 * 1. voices 异步加载 —— voiceschanged 监听 + setTimeout 轮询兜底
 * 2. 连续点击 —— 每次 speak() 前 cancel()，避免重叠
 * 3. 防抖 —— 300ms 内重复触发只响应一次
 * 4. 不支持降级 —— Speech.supported 检测
 */
(function () {
  const DEBOUNCE_MS = 300;

  let cachedVoice = null;
  let lastSpeakAt = 0;
  let onReadyCb = null;

  const supported = 'speechSynthesis' in window;

  function initVoices() {
    if (!supported) return;

    const pick = () => {
      const voices = speechSynthesis.getVoices();
      cachedVoice =
        voices.find(v => v.lang === 'zh-CN') ||
        voices.find(v => v.lang === 'zh') ||
        voices.find(v => v.lang.startsWith('zh')) ||
        null;
      if (cachedVoice && onReadyCb) {
        onReadyCb(cachedVoice);
        onReadyCb = null;
      }
    };

    pick();
    if (!cachedVoice) {
      speechSynthesis.onvoiceschanged = pick;
      setTimeout(pick, 500);
      setTimeout(pick, 1500);
    } else if (onReadyCb) {
      // 已有音色，异步回调
      setTimeout(() => { onReadyCb(cachedVoice); onReadyCb = null; }, 0);
    }
  }

  function speak(text, opts = {}) {
    if (!supported || !text?.trim()) return false;
    const now = Date.now();
    if (now - lastSpeakAt < DEBOUNCE_MS) return false;
    lastSpeakAt = now;

    speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = opts.rate ?? 0.8;
    u.pitch = opts.pitch ?? 1.0;
    if (cachedVoice) u.voice = cachedVoice;

    u.onstart = opts.onstart || (() => {});
    u.onend   = opts.onend   || (() => {});
    u.onerror = opts.onerror || ((e) => console.warn('[Speech]', e.error));

    speechSynthesis.speak(u);
    return true;
  }

  function speakSequence(items, opts = {}) {
    if (!supported) return;
    const interval = opts.interval ?? 1000;
    let index = 0;
    const next = () => {
      if (index >= items.length) { opts.onFinish?.(); return; }
      const item = items[index++];
      const text = typeof item === 'string' ? item : item.text;
      speak(text, { ...opts, onend: () => setTimeout(next, interval) });
    };
    next();
  }

  window.Speech = {
    supported,
    ready() { return !!cachedVoice; },
    get voice() { return cachedVoice; },
    onReady(cb) {
      if (cachedVoice) cb(cachedVoice);
      else onReadyCb = cb;
    },
    speak,
    speakSequence,
    stop() { supported && speechSynthesis.cancel(); },
    init: initVoices,
    DEFAULT_RATE: 0.8,
  };

  document.addEventListener('DOMContentLoaded', initVoices);
})();
