/**
 * 数据加载器
 * - 聚合所有独立语料文件
 * - 提供统一访问接口
 * - 附带分组元信息（label / icon / desc）
 */
(function () {
  const groups = {
    initials: {
      label: '声母 Initials',
      icon: '🔤',
      desc: '23 个声母，点击听发音',
      data: () => window.Data_initials,
      page: 'pages/initials.html',
    },
    finals: {
      label: '韵母 Finals',
      icon: '🔡',
      desc: '24 个韵母，点击听发音',
      data: () => window.Data_finals,
      page: 'pages/finals.html',
    },
    tones: {
      label: '四声 Tones',
      icon: '🎵',
      desc: '同一个音节的四种声调对比',
      data: () => window.Data_tones,
      page: 'pages/tones.html',
    },
    characters: {
      label: '常用字 Characters',
      icon: '📝',
      desc: 'HSK 1 级高频字',
      data: () => window.Data_characters,
      page: 'pages/characters.html',
    },
    scenes: {
      label: '场景句子 Sentences',
      icon: '💬',
      desc: '真实交流场景中的句子',
      data: () => window.Data_scenes,
      page: 'pages/scenes.html',
    },
    minimal: {
      label: '最小对立体 Minimal',
      icon: '⚡',
      desc: '针对 zh/z、b/p、n/l、ü/u、-n/-ng',
      data: () => window.Data_minimal,
      page: 'pages/minimal.html',
    },
  };

  window.DataLoader = {
    GROUPS: groups,
    getGroup(key) {
      const g = groups[key];
      if (!g) return null;
      return { ...g, items: g.data() };
    },
    getData(key) {
      return groups[key]?.data() || [];
    },
    getAllKeys() {
      return Object.keys(groups);
    },
  };
})();
