/**
 * 渲染逻辑 & 交互
 * 纯原生 JS，零依赖
 */

const App = (() => {
  let currentGroup = 'initials';   // 当前选中的分组
  let currentRate = Speech.DEFAULT_RATE;

  // ============ 初始化 ============
  function init() {
    if (!Speech.supported) {
      showNotSupported();
      return;
    }
    renderNav();
    renderGroup(currentGroup);
    setupGlobalListeners();
  }

  // ============ 顶部导航 ============
  function renderNav() {
    const nav = document.getElementById('nav');
    nav.innerHTML = Object.keys(CORPUS).map(key => {
      const meta = GROUP_META[key];
      const active = key === currentGroup ? 'active' : '';
      return `
        <button class="nav-btn ${active}" data-group="${key}">
          <span class="nav-icon">${meta.icon}</span>
          <span class="nav-label">${meta.label}</span>
        </button>
      `;
    }).join('');

    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-btn');
      if (!btn) return;
      const group = btn.dataset.group;
      if (group !== currentGroup) {
        currentGroup = group;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.group === group));
        renderGroup(group);
      }
    });
  }

  // ============ 渲染某个分组 ============
  function renderGroup(groupKey) {
    const container = document.getElementById('cards');
    const meta = GROUP_META[groupKey];
    const items = CORPUS[groupKey] || [];

    // 更新标题
    document.getElementById('group-title').textContent = meta.label;
    document.getElementById('group-desc').textContent = meta.desc;

    // 最小对立体特殊渲染（两列对比）
    if (groupKey === 'minimal') {
      renderMinimalPairs(container, items);
      return;
    }

    // 通用卡片网格
    container.className = 'cards-grid';
    container.innerHTML = items.map(item => cardHTML(item)).join('');

    // 绑定点击事件（事件委托）
    container.onclick = (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      // 小喇叭按钮：拦截冒泡，只播放不切换 active
      if (e.target.closest('.play-btn')) {
        e.stopPropagation();
      }
      const text = card.dataset.text;
      if (text) {
        card.classList.add('playing');
        Speech.speak(text, {
          rate: currentRate,
          onend: () => card.classList.remove('playing'),
        });
      }
    };
  }

  // ============ 单个卡片 HTML ============
  function cardHTML(item) {
    const toneClass = item.tone ? `tone-${item.tone}` : '';
    const subtitle = item.meaning || '';
    return `
      <div class="card ${toneClass}" data-text="${item.text}">
        <button class="play-btn" aria-label="Play">🔊</button>
        <div class="card-pinyin">${item.pinyin || ''}</div>
        <div class="card-text">${item.text}</div>
        <div class="card-sub">${subtitle}</div>
      </div>
    `;
  }

  // ============ 最小对立体特殊渲染 ============
  function renderMinimalPairs(container, pairs) {
    container.className = 'pairs-list';
    container.innerHTML = pairs.map(p => {
      const [left, right] = p.text.split(' / ');
      const [pyL, pyR] = p.pinyin.split(' / ');
      return `
        <div class="pair" data-left="${left}" data-right="${right}" data-both="${p.text}">
          <div class="pair-contrast">${p.contrast}</div>
          <div class="pair-items">
            <div class="pair-item" data-text="${left}">
              <button class="play-btn" aria-label="Play">🔊</button>
              <div class="pair-py">${pyL}</div>
              <div class="pair-text">${left}</div>
            </div>
            <div class="vs">VS</div>
            <div class="pair-item" data-text="${right}">
              <button class="play-btn" aria-label="Play">🔊</button>
              <div class="pair-py">${pyR}</div>
              <div class="pair-text">${right}</div>
            </div>
          </div>
          <button class="pair-play-all" data-all="${p.text}">▶ 连听两遍</button>
          <div class="pair-meaning">${p.meaning}</div>
        </div>
      `;
    }).join('');

    container.onclick = (e) => {
      const pairItem = e.target.closest('.pair-item');
      if (pairItem) {
        e.stopPropagation();
        const text = pairItem.dataset.text;
        pairItem.classList.add('playing');
        Speech.speak(text, {
          rate: currentRate,
          onend: () => pairItem.classList.remove('playing'),
        });
        return;
      }
      const playAll = e.target.closest('.pair-play-all');
      if (playAll) {
        const pair = e.target.closest('.pair');
        const left = pair.dataset.left;
        const right = pair.dataset.right;
        Speech.speakSequence([left, right], { rate: currentRate, interval: 1200 });
      }
    };
  }

  // ============ 全局事件 ============
  function setupGlobalListeners() {
    // 语速调节
    const rateSlider = document.getElementById('rate');
    const rateLabel = document.getElementById('rate-label');
    rateSlider.addEventListener('input', (e) => {
      currentRate = parseFloat(e.target.value);
      rateLabel.textContent = currentRate.toFixed(1) + 'x';
    });

    // 全部朗读停止按钮
    document.getElementById('stop-btn').addEventListener('click', () => {
      Speech.stop();
      document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
    });

    // 键盘快捷键：空格=停止
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        Speech.stop();
      }
    });

    // 音色加载完成提示
    window.addEventListener('speech-ready', () => {
      const badge = document.getElementById('voice-badge');
      if (Speech.voice) {
        badge.textContent = '🎙 ' + Speech.voice.name;
        badge.classList.add('ready');
      }
    });
  }

  // ============ 不支持提示 ============
  function showNotSupported() {
    document.getElementById('cards').innerHTML = `
      <div class="warning">
        <h2>⚠️ 你的浏览器不支持 Web Speech API</h2>
        <p>请使用最新版 Chrome / Edge / Safari 打开本页面。</p>
        <p>推荐：<a href="https://www.google.com/chrome/" target="_blank">下载 Chrome</a></p>
      </div>
    `;
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
