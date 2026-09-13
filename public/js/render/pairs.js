/**
 * 最小对立体渲染器 —— 两列对比 + 连听按钮
 * 最小对立体是特殊 UI，独立模块
 */
(function () {
  function pairHTML(p) {
    const [left, right] = p.text.split(' / ');
    const [pyL, pyR] = p.pinyin.split(' / ');
    return `
      <div class="pair">
        <div class="pair-contrast">${p.contrast}</div>
        <div class="pair-items">
          <div class="pair-item" data-text="${left}">
            <button class="play-btn">🔊</button>
            <div class="pair-py">${pyL}</div>
            <div class="pair-text">${left}</div>
          </div>
          <div class="vs">VS</div>
          <div class="pair-item" data-text="${right}">
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
        const text = pairItem.dataset.text;
        pairItem.classList.add('playing');
        Speech.speak(text, { rate, onend: () => pairItem.classList.remove('playing') });
        return;
      }
      const playAll = e.target.closest('.pair-play-all');
      if (playAll) {
        const pair = e.target.closest('.pair');
        const all = pair.querySelectorAll('.pair-item');
        Speech.speakSequence(
          [all[0].dataset.text, all[1].dataset.text],
          { rate, interval: 1200 }
        );
      }
    };
  }

  window.RenderPairs = { render };
})();
