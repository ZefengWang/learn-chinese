/**
 * 卡片网格渲染器 —— 声母/韵母/声调/常用字/场景句子 共用
 * 纯函数：根据 items 数组生成 DOM，绑定事件委托
 */
(function () {
  // 生成单个卡片 HTML
  function cardHTML(item) {
    const toneClass = item.tone ? `tone-${item.tone}` : '';
    return `
      <div class="card ${toneClass}" data-text="${item.text}">
        <button class="play-btn" aria-label="Play">🔊</button>
        <div class="card-pinyin">${item.pinyin || ''}</div>
        <div class="card-text">${item.text}</div>
        <div class="card-sub">${item.meaning || ''}</div>
      </div>
    `;
  }

  // 渲染整个网格 + 绑定点击
  function render(container, items, opts = {}) {
    const rate = opts.rate ?? 0.8;
    container.className = 'cards-grid';
    container.innerHTML = items.map(cardHTML).join('');

    container.onclick = (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      if (e.target.closest('.play-btn')) e.stopPropagation();
      const text = card.dataset.text;
      if (!text) return;
      card.classList.add('playing');
      Speech.speak(text, {
        rate,
        onend: () => card.classList.remove('playing'),
      });
    };
  }

  window.RenderCards = { render };
})();
