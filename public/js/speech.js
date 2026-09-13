/**
 * Web Speech API 播放器
 * 
 * 设计要点（来自过往经验）：
 * 1. voices 异步加载 —— 监听 voiceschanged + 轮询预热，缓存可用 voice
 * 2. 点击连续触发 —— 先 cancel() 再 speak()，避免重叠
 * 3. 防抖 —— 短时间内重复点击只响应一次
 * 4. 不支持降级 —— 检测后给出提示
 */

const Speech = (() => {
  // ============ 状态 ============
  let cachedVoice = null;       // 缓存的 zh-CN 音色
  let isReady = false;          // 音色是否加载完毕
  let lastSpeakAt = 0;          // 上次播放时间戳（防抖用）
  const DEBOUNCE_MS = 300;      // 防抖间隔
  const DEFAULT_RATE = 0.8;     // 语速（0.8 适合学习）
  const DEFAULT_PITCH = 1.0;    // 音调

  // ============ 能力检测 ============
  const supported = 'speechSynthesis' in window;

  // ============ 音色预热 ============
  function initVoices() {
    if (!supported) return;

    const pickZhVoice = () => {
      const voices = speechSynthesis.getVoices();
      // 优先选 zh-CN，次选 zh，再选任何中文音色
      cachedVoice =
        voices.find(v => v.lang === 'zh-CN') ||
        voices.find(v => v.lang === 'zh') ||
        voices.find(v => v.lang.startsWith('zh')) ||
        null;

      if (cachedVoice) {
        isReady = true;
        // 触发自定义事件，UI 可监听
        window.dispatchEvent(new CustomEvent('speech-ready'));
      }
    };

    // 第一次调用通常返回空数组，需要等待 voiceschanged
    pickZhVoice();

    if (!cachedVoice) {
      speechSynthesis.onvoiceschanged = pickZhVoice;
      // 兜底：部分浏览器不触发 voiceschanged，轮询一次
      setTimeout(pickZhVoice, 500);
      setTimeout(pickZhVoice, 1500);
    }
  }

  // ============ 核心播放函数 ============
  /**
   * 朗读中文文本
   * @param {string} text 要朗读的中文
   * @param {object} opts { rate, pitch, onstart, onend, onerror }
   */
  function speak(text, opts = {}) {
    if (!supported) {
      console.warn('[Speech] Web Speech API not supported');
      return false;
    }
    if (!text || !text.trim()) return false;

    // 防抖
    const now = Date.now();
    if (now - lastSpeakAt < DEBOUNCE_MS) return false;
    lastSpeakAt = now;

    // 停掉之前的（避免重叠）
    speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = opts.rate ?? DEFAULT_RATE;
    u.pitch = opts.pitch ?? DEFAULT_PITCH;
    if (cachedVoice) u.voice = cachedVoice;

    u.onstart = opts.onstart || (() => {});
    u.onend   = opts.onend   || (() => {});
    u.onerror = opts.onerror || ((e) => console.warn('[Speech] error:', e.error));

    speechSynthesis.speak(u);
    return true;
  }

  // ============ 朗读带停顿 ============
  /**
   * 依次朗读多个文本片段，中间有停顿
   * 用于最小对立体：先读 "zhīdào" 停顿 1 秒，再读 "zīdào"
   */
  function speakSequence(items, opts = {}) {
    if (!supported) return;
    const interval = opts.interval ?? 1000; // ms

    let index = 0;
    const playNext = () => {
      if (index >= items.length) {
        opts.onFinish?.();
        return;
      }
      const item = items[index++];
      speak(typeof item === 'string' ? item : item.text, {
        ...opts,
        onend: () => {
          setTimeout(playNext, interval);
        },
      });
    };
    playNext();
  }

  // ============ 停止 ============
  function stop() {
    if (supported) speechSynthesis.cancel();
  }

  // ============ 初始化 ============
  function init() {
    initVoices();
  }

  // 暴露
  return {
    supported,
    get ready() { return isReady; },
    get voice() { return cachedVoice; },
    speak,
    speakSequence,
    stop,
    init,
    DEFAULT_RATE,
    DEFAULT_PITCH,
  };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', Speech.init);
