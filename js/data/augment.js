/**
 * 运行时数据增强 —— 给 DataLoader 每个分组的每条 item 注入 audio 路径
 *
 * 规则：audio/<group>/<id>.mp3
 *   group: initials | finals | tones | characters | scenes | minimal
 *   id:    数据条目的 id 字段
 *
 * 这样数据文件本身保持纯净（只有语料），
 * audio 路径是"派生属性"由运行时统一注入。
 */
(function () {
  const AUDIO_BASE = 'audio';

  function augment() {
    if (!window.DataLoader) {
      console.warn('[AudioAugment] DataLoader 未就绪');
      return;
    }
    // 子页面（pages/）需要 ../ 前缀回到上级
    const prefix = location.pathname.includes('/pages/') ? '../' : '';
    for (const group of window.DataLoader.getAllKeys()) {
      const g = window.DataLoader.GROUPS[group];
      const rawItems = g.data();
      for (const item of rawItems) {
        if (!item.audio) {
          item.audio = `${prefix}audio/${group}/${item.id}.mp3`;
        }
        if (!item.hanzi) {
          item.hanzi = extractHanzi(group, item);
        }
      }
    }
    console.log(`[AudioAugment] 已注入 ${window.DataLoader.getAllKeys().length} 个分组的 audio 路径 (prefix="${prefix}")`);
  }

  // 为 Web Speech fallback 准备一个合理的汉字/中文文本
  function extractHanzi(group, item) {
    // 在字符串里找第一个中文
    const firstHanzi = (s) => {
      if (!s) return '';
      const m = s.match(/[\u4e00-\u9fff]/);
      return m ? m[0] : '';
    };

    switch (group) {
      case 'initials':
      case 'finals':
        // meaning 形如 "波 / bo" 或 "啊 / a"
        return firstHanzi(item.meaning);
      case 'tones':
        // text 形如 "mā 妈"
        return firstHanzi(item.text);
      case 'characters':
      case 'scenes':
        // text 直接就是中文
        return item.text || '';
      case 'minimal':
        // text 形如 "知道 / 资道"，去掉分隔符
        return (item.text || '').replace(' / ', '');
      default:
        return '';
    }
  }

  // 立即执行 —— augment 只依赖 DataLoader（已在 index.js 中定义），不需要等 DOM
  if (window.DataLoader) {
    augment();
  } else {
    console.warn('[AudioAugment] DataLoader 未就绪，稍后重试');
    document.addEventListener('DOMContentLoaded', augment);
  }

  window.AudioAugment = { augment };
})();
