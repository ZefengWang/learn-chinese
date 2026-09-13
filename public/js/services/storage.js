/**
 * localStorage 状态持久化（Service Layer）
 * 存储用户偏好（语速等），刷新后不丢失
 */
(function () {
  const KEY = 'zhlab_prefs';
  const DEFAULTS = { rate: 0.8 };

  function load() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch { return { ...DEFAULTS }; }
  }

  function save(prefs) {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  }

  window.Prefs = { load, save };
})();
