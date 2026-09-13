/**
 * 共享渲染器：Header / Nav / Controls
 * 各页面都会用到的通用 UI 组件
 */
(function () {
  // Header：标题 + 音色状态
  function renderHeader(container, title, subtitle) {
    container.innerHTML = `
      <h1>${title || '🔊 中文发音语料库'}</h1>
      <p>${subtitle || 'Chinese Pronunciation Lab'}</p>
      <span id="voice-badge" class="voice-badge">⏳ 加载中文音色…</span>
    `;
    Speech.onReady((voice) => {
      const badge = document.getElementById('voice-badge');
      if (badge) {
        badge.textContent = '🎙 ' + voice.name;
        badge.classList.add('ready');
      }
    });
  }

  function renderNav(container, currentKey) {
    // 判断当前在 pages/ 子页还是首页，自适应路径
    const inSubPage = location.pathname.includes('/pages/');
    const base = inSubPage ? '../' : '';
    const keys = DataLoader.getAllKeys();
    container.innerHTML = keys.map(key => {
      const g = DataLoader.GROUPS[key];
      const active = key === currentKey ? 'active' : '';
      return `
        <a class="nav-btn ${active}" href="${base}${g.page}">
          <span class="nav-icon">${g.icon}</span>
          <span class="nav-label">${g.label}</span>
        </a>
      `;
    }).join('');
  }

  // Controls：语速滑块 + 停止按钮
  function renderControls(container, prefs, onRateChange, onStop) {
    container.innerHTML = `
      <div class="rate-control">
        <span>🐢</span>
        <input type="range" id="rate" min="0.4" max="1.4" step="0.1" value="${prefs.rate}">
        <span>🐇</span>
        <span id="rate-label">${parseFloat(prefs.rate).toFixed(1)}x</span>
      </div>
      <button id="stop-btn" class="stop-btn">⏹ 停止（空格）</button>
    `;
    document.getElementById('rate').addEventListener('input', (e) => {
      const rate = parseFloat(e.target.value);
      document.getElementById('rate-label').textContent = rate.toFixed(1) + 'x';
      onRateChange?.(rate);
    });
    document.getElementById('stop-btn').addEventListener('click', onStop);
  }

  // 不支持降级
  function showFallback(container) {
    container.innerHTML = `
      <div class="warning">
        <h2>⚠️ 浏览器不支持 Web Speech API</h2>
        <p>请使用 Chrome / Edge / Safari 最新版。</p>
        <p><a href="https://www.google.com/chrome/" target="_blank">下载 Chrome</a></p>
      </div>
    `;
  }

  window.RenderShared = { renderHeader, renderNav, renderControls, showFallback };
})();
