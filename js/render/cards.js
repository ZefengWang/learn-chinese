/**
 * 卡片网格渲染器 —— 声母/韵母/声调/常用字/场景句子 共用
 * 纯函数：根据 items 数组生成 DOM，绑定事件委托
 *
 * 播放逻辑：优先真实 mp3（item.audio），fallback Web Speech（item.hanzi）
 */
(function () {
  function cardHTML(item) {
    const toneClass = item.tone ? `tone-${item.tone}` : '';
    return `
      <div class="card ${toneClass}"
           data-id="${item.id || ''}"
           data-audio="${item.audio || ''}"
           data-hanzi="${item.hanzi || ''}">
        <button class="play-btn" aria-label="Play">🔊</button>
        <div class="card-pinyin">${item.pinyin || ''}</div>
        <div class="card-text">${item.text}</div>
        <div class="card-sub">${item.meaning || ''}</div>
      </div>
    `;
  }

  function render(container, items, opts = {}) {
    const rate = opts.rate ?? 0.8;
    container.className = 'cards-grid';
    container.innerHTML = items.map(cardHTML).join('');

    container.onclick = (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      if (e.target.closest('.play-btn')) e.stopPropagation();

      // 从 dataset 组装 item —— 保持 playItem 接口一致
      const item = {
        id: card.dataset.id,
        audio: card.dataset.audio || null,
        hanzi: card.dataset.hanzi || null,
        text: card.dataset.hanzi || card.textContent, // fallback
      };

      // 每次点击前清掉所有 playing 状态（快速切卡时上一个可能还没 onend）
      document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
      card.classList.add('playing');
      Speech.playItem(item, {
        rate,
        onend: () => card.classList.remove('playing'),
      });
    };
  }

  window.RenderCards = { render };
})();
