/**
 * 最小对立体渲染器 —— 两列对比 + 连听按钮
 *
 * 播放逻辑：
 *   - "连听两遍"按钮 → 播放整条 mp3（item.audio）
 *   - 点击单个 pair-item → Web Speech 读汉字（没有单独的 mp3）
 */
(function () {
  function pairHTML(p) {
    const [left, right] = p.text.split(' / ');
    const [pyL, pyR] = p.pinyin.split(' / ');
    return `
      <div class="pair"
           data-id="${p.id || ''}"
           data-audio="${p.audio || ''}"
           data-hanzi="${p.hanzi || ''}">
        <div class="pair-contrast">${p.contrast}</div>
        <div class="pair-items">
          <div class="pair-item" data-hanzi="${left}">
            <button class="play-btn">🔊</button>
            <div class="pair-py">${pyL}</div>
            <div class="pair-text">${left}</div>
          </div>
          <div class="vs">VS</div>
          <div class="pair-item" data-hanzi="${right}">
            <button class="play-btn">🔊</button>
            <div class="pair-py">${pyR}</div>
            <div class="pair-text">${right}</div>
          </div>
        </div>
        <button class="pair-play-all">▶ 连听两遍</button>
        <div class="pair-meaning">${p.meaning}</div>
      </div>
    `;
  }

  function render(container, pairs, opts = {}) {
    const rate = opts.rate ?? 0.8;
    container.className = 'pairs-list';
    container.innerHTML = pairs.map(pairHTML).join('');

    container.onclick = (e) => {
      const pairItem = e.target.closest('.pair-item');
      if (pairItem) {
        // 单个 pair-item —— 读左边或右边的汉字（Web Speech fallback）
        const hanzi = pairItem.dataset.hanzi;
        pairItem.classList.add('playing');
        Speech.speak(hanzi, { rate, onend: () => pairItem.classList.remove('playing') });
        return;
      }

      const playAll = e.target.closest('.pair-play-all');
      if (playAll) {
        // 整条播放 —— 优先 mp3
        const pair = e.target.closest('.pair');
        const item = {
          id: pair.dataset.id,
          audio: pair.dataset.audio || null,
          hanzi: pair.dataset.hanzi || null,
          text: pair.dataset.hanzi || '',
        };
        // 播放两遍，间隔 800ms
        const interval = 800;
        let count = 0;
        const playOnce = () => {
          Speech.playItem(item, {
            rate,
            onend: () => {
              count++;
              if (count < 2) {
                setTimeout(playOnce, interval);
              } else {
                pair.classList.remove('playing');
              }
            },
          });
        };
        pair.classList.add('playing');
        playOnce();
      }
    };
  }

  window.RenderPairs = { render };
})();
