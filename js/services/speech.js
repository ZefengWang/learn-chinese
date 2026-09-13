/**
 * 语音播放服务（Service Layer）
 *
 * 播放优先级：
 *   1. 如果 item 有 audio 字段（真实 mp3）→ HTML5 Audio 播放
 *   2. 否则 → Web Speech API 合成播放（fallback）
 *
 * 稳定性设计：
 *   - audio 对象缓存复用（避免每次 new Audio() 加载开销）
 *   - 全局防抖 300ms，audio + speech 共用
 *   - stop() 同时停掉 audio 和 speechSynthesis
 *   - 连续点击自动 cancel 上一个
 */
(function () {
  const DEBOUNCE_MS = 300;
  const AUDIO_FALLBACK_RATE = 0.8; // 备用 Web Speech 的语速

  // —— 状态 ——
  let cachedVoice = null;
  let lastPlayAt = 0;
  let onReadyCb = null;
  let currentAudio = null;        // 当前正在播放的 audio 元素
  const audioCache = new Map();   // url → HTMLAudioElement 缓存

  const speechSupported = 'speechSynthesis' in window;

  // —— 初始化 Web Speech voices（仅作 fallback）——
  function initVoices() {
    if (!speechSupported) return;

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
      setTimeout(() => { onReadyCb(cachedVoice); onReadyCb = null; }, 0);
    }
  }

  function debounce() {
    const now = Date.now();
    if (now - lastPlayAt < DEBOUNCE_MS) return false;
    lastPlayAt = now;
    return true;
  }

  function stopAll() {
    if (currentAudio) {
      try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
      currentAudio = null;
    }
    if (speechSupported) speechSynthesis.cancel();
  }

  // —— HTML5 Audio 播放 ——
  function playAudio(url, opts = {}) {
    if (!url) return false;
    if (!debounce()) return false;

    stopAll();

    // 从缓存拿 audio 对象
    let audio = audioCache.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.preload = 'auto';
      audioCache.set(url, audio);
    }

    currentAudio = audio;

    audio.onplay  = opts.onstart || (() => {});
    audio.onended = opts.onend   || (() => {});
    audio.onerror = opts.onerror || ((e) => {
      console.warn('[Speech.audio] 播放失败:', url, e);
      // 自动 fallback 到 Web Speech，如果给了 text
      if (opts.fallbackText) {
        console.warn('[Speech] fallback 到 Web Speech');
        speakFallback(opts.fallbackText, opts);
      }
    });

    try {
      audio.currentTime = 0;
      audio.play().catch((e) => {
        console.warn('[Speech.audio] play() 被拒绝:', e.name);
        if (opts.fallbackText) speakFallback(opts.fallbackText, opts);
      });
      return true;
    } catch (e) {
      console.warn('[Speech.audio] 异常:', e);
      if (opts.fallbackText) speakFallback(opts.fallbackText, opts);
      return false;
    }
  }

  // —— Web Speech API（fallback）——
  function speakFallback(text, opts = {}) {
    if (!speechSupported || !text?.trim()) return false;

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = opts.rate ?? AUDIO_FALLBACK_RATE;
    u.pitch = opts.pitch ?? 1.0;
    if (cachedVoice) u.voice = cachedVoice;

    u.onstart = opts.onstart || (() => {});
    u.onend   = opts.onend   || (() => {});
    u.onerror = opts.onerror || ((e) => console.warn('[Speech.fallback]', e.error));

    speechSynthesis.speak(u);
    return true;
  }

  // —— 旧接口兼容（直接给 text，用 Web Speech）——
  function speak(text, opts = {}) {
    if (!debounce()) return false;
    stopAll();
    return speakFallback(text, opts);
  }

  function speakSequence(items, opts = {}) {
    const interval = opts.interval ?? 1000;
    let index = 0;
    const next = () => {
      if (index >= items.length) { opts.onFinish?.(); return; }
      const item = items[index++];
      // 如果 item 是对象且有 audio，优先 audio
      if (typeof item === 'object' && item.audio) {
        playAudio(item.audio, { ...opts, fallbackText: item.text, onend: () => setTimeout(next, interval) });
      } else {
        const text = typeof item === 'string' ? item : item.text;
        speak(text, { ...opts, onend: () => setTimeout(next, interval) });
      }
    };
    next();
  }

  // —— 主入口：给一个数据条目自动选最佳播放方式 ——
  function playItem(item, opts = {}) {
    if (!item) return false;
    if (item.audio) {
      return playAudio(item.audio, { ...opts, fallbackText: item.hanzi || item.text });
    }
    // 没有 audio，看有没有可用的汉字字段
    const fallback = item.hanzi || item.text || item.meaning;
    return speak(fallback || '', opts);
  }

  window.Speech = {
    supported: true,  // audio 总是支持，speechSynthesis 是附加
    speechSupported,
    ready() { return true; },  // audio 不需要等 voice
    get voice() { return cachedVoice; },
    onReady(cb) {
      if (cachedVoice || !speechSupported) cb(cachedVoice);
      else onReadyCb = cb;
    },

    // 三个播放入口，按优先级：
    playItem,       // ★ 推荐：给 item 自动选最优方式
    playAudio,      // 直接放 mp3
    speak,          // 直接用 Web Speech（旧接口兼容）

    speakSequence,
    stop: stopAll,
    clearCache() { audioCache.clear(); currentAudio = null; },
    init: initVoices,
    DEFAULT_RATE: 0.8,
  };

  document.addEventListener('DOMContentLoaded', initVoices);
})();
