/**
 * 主入口 —— 按 data-page 属性路由到不同渲染器
 * 每个页面声明自己的 data-page="xxx"，app.js 自动分发
 */
(function () {
  // 等待所有模块就绪（script 按顺序加载，此处在 DOMContentLoaded 之后触发）
  const prefs = Prefs.load();
  let currentRate = prefs.rate;

  // 全局快捷键：空格停止
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      Speech.stop();
      document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
    }
  });

  // 渲染 Controls（所有页面通用）
  RenderShared.renderControls(
    document.getElementById('controls'),
    prefs,
    (rate) => {
      currentRate = rate;
      Prefs.save({ ...prefs, rate });
    },
    () => {
      Speech.stop();
      document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
    }
  );

  // 不支持降级
  if (!Speech.supported) {
    const main = document.getElementById('main') || document.getElementById('cards');
    if (main) RenderShared.showFallback(main);
    return;
  }

  // 路由：根据 data-page 决定渲染什么
  const pageType = document.body.dataset.page;

  // 所有页面都先渲染 header + nav + group header
  const group = DataLoader.getGroup(pageType);
  if (group) {
    RenderShared.renderHeader(
      document.getElementById('header'),
      group.label,
      group.desc
    );
    // Nav 不在首页（index.html）时渲染，首页有独立布局
    const navEl = document.getElementById('nav');
    if (navEl) RenderShared.renderNav(navEl, pageType);

    const gh = document.getElementById('group-header');
    if (gh) {
      gh.innerHTML = `<h2>${group.label}</h2><p>${group.desc} · 共 ${group.items.length} 条</p>`;
    }

    // 分发到对应渲染器
    const container = document.getElementById('cards');
    if (container) {
      if (pageType === 'minimal') {
        RenderPairs.render(container, group.items, { rate: currentRate });
      } else {
        RenderCards.render(container, group.items, { rate: currentRate });
      }
    }
  }
})();
