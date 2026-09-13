/**
 * 数据层单元测试 — 纯 Node.js，无浏览器依赖
 * 直接读取 js/data/*.js 文件，用 vm 模块执行并提取 window.Data_*
 */
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { TestRunner, assert } = require('./assert');

const runner = new TestRunner();

// —— 共享沙箱：用 vm.createContext 确保所有文件写入同一个 window ——
const DATA_DIR = path.join(__dirname, '..', 'js', 'data');
const ctx = {};
ctx.window = ctx;
vm.createContext(ctx);

function loadDataFile(name) {
  const fp = path.join(DATA_DIR, name);
  vm.runInContext(fs.readFileSync(fp, 'utf8'), ctx, { filename: fp });
}

// —— 预加载所有数据 ——
loadDataFile('initials.js');
loadDataFile('finals.js');
loadDataFile('tones.js');
loadDataFile('characters.js');
loadDataFile('scenes.js');
loadDataFile('minimal.js');
loadDataFile('index.js');

const window = ctx;

// ========================================
// 测试开始
// ========================================

runner.describe('数据层 · 语料完整性', () => {

  runner.it('initials 应导出 23 个声母', () => {
    const arr = window.Data_initials;
    assert(arr).array();
    assert(arr).lengthOf(23);
  });

  runner.it('initials 每条必须有 id / text / pinyin / meaning', () => {
    for (const item of window.Data_initials) {
      assert(item).hasKey('id');
      assert(item).hasKey('text');
      assert(item).hasKey('pinyin');
      assert(item).hasKey('meaning');
      assert(item.id).string();
      assert(item.text).string();
      assert(item.pinyin).string();
      assert(item.meaning).string();
    }
  });

  runner.it('initials 的 id 应该是 b p m f d t n l g k h j q x zh ch sh r z c s y w', () => {
    const ids = window.Data_initials.map(i => i.id).sort();
    const expected = ['b','c','ch','d','f','g','h','j','k','l','m','n','p','q','r','s','sh','t','w','x','y','z','zh'].sort();
    assert(ids).eq(expected);
  });

  runner.it('finals 应导出 24 个韵母', () => {
    const arr = window.Data_finals;
    assert(arr).array();
    assert(arr).lengthOf(24);
  });

  runner.it('finals 每条必须有 id / text / pinyin / meaning', () => {
    for (const item of window.Data_finals) {
      assert(item).hasKey('id');
      assert(item).hasKey('text');
      assert(item).hasKey('pinyin');
      assert(item).hasKey('meaning');
    }
  });

  runner.it('tones 应导出 17 条声调示范', () => {
    const arr = window.Data_tones;
    assert(arr).array();
    assert(arr).lengthOf(17);
  });

  runner.it('tones 每条必须有 tone 字段，值在 1-5', () => {
    for (const item of window.Data_tones) {
      assert(item).hasKey('tone');
      assert(item.tone).number();
      assert(item.tone).gte(1);
      assert(item.tone).lte(5);
    }
  });

  runner.it('tones 应包含 1-4 声（轻声 5 可选）', () => {
    const tones = new Set(window.Data_tones.map(i => i.tone));
    assert(tones.has(1)).true('缺少一声');
    assert(tones.has(2)).true('缺少二声');
    assert(tones.has(3)).true('缺少三声');
    assert(tones.has(4)).true('缺少四声');
  });

  runner.it('characters 应导出至少 20 个常用字', () => {
    const arr = window.Data_characters;
    assert(arr).array();
    assert(arr.length).gte(20);
  });

  runner.it('characters 每条必须有 id / text / pinyin / meaning', () => {
    for (const item of window.Data_characters) {
      assert(item).hasKey('id');
      assert(item).hasKey('text');
      assert(item).hasKey('pinyin');
      assert(item).hasKey('meaning');
    }
  });

  runner.it('scenes 应导出至少 15 条场景句子', () => {
    const arr = window.Data_scenes;
    assert(arr).array();
    assert(arr.length).gte(15);
  });

  runner.it('scenes 每条必须有 id / text / pinyin / meaning', () => {
    for (const item of window.Data_scenes) {
      assert(item).hasKey('id');
      assert(item).hasKey('text');
      assert(item).hasKey('pinyin');
      assert(item).hasKey('meaning');
    }
  });

  runner.it('minimal 应导出至少 5 组最小对立体', () => {
    const arr = window.Data_minimal;
    assert(arr).array();
    assert(arr.length).gte(5);
  });

  runner.it('minimal 每组必须有 id / text / pinyin / meaning / contrast', () => {
    for (const item of window.Data_minimal) {
      assert(item).hasKey('id');
      assert(item).hasKey('text');
      assert(item).hasKey('pinyin');
      assert(item).hasKey('meaning');
      assert(item).hasKey('contrast');
    }
  });

  runner.it('minimal 的 text/pinyin 中应包含分隔符（/ 或 -）表示两个对比音', () => {
    for (const item of window.Data_minimal) {
      assert(item.text).match(/[\/\-]/, `minimal id=${item.id} text 无分隔符: "${item.text}"`);
      assert(item.pinyin).match(/[\/\-]/, `minimal id=${item.id} pinyin 无分隔符: "${item.pinyin}"`);
    }
  });

  runner.it('minimal 的 contrast 应该覆盖 zh-z、b-p、n-l、ü/u、n-ng 中的至少 3 组', () => {
    const contrasts = new Set(window.Data_minimal.map(i => i.contrast));
    assert(contrasts.size).gte(3, `contrast 种类太少: ${[...contrasts].join(', ')}`);
  });

  runner.it('所有数据条目 text 字段不应为空字符串', () => {
    const all = [
      ...window.Data_initials,
      ...window.Data_finals,
      ...window.Data_tones,
      ...window.Data_characters,
      ...window.Data_scenes,
    ];
    for (const item of all) {
      assert(item.text.length).gt(0, `id=${item.id} text 为空`);
    }
  });

  runner.it('所有数据条目 pinyin 字段不应为空字符串', () => {
    const all = [
      ...window.Data_initials,
      ...window.Data_finals,
      ...window.Data_tones,
      ...window.Data_characters,
      ...window.Data_scenes,
    ];
    for (const item of all) {
      assert(item.pinyin.length).gt(0, `id=${item.id} pinyin 为空`);
    }
  });

  runner.it('所有 id 应该唯一（每个数据集内部）', () => {
    for (const [name, key] of [['initials','Data_initials'],['finals','Data_finals'],['tones','Data_tones'],['characters','Data_characters'],['scenes','Data_scenes'],['minimal','Data_minimal']]) {
      const ids = window[key].map(i => i.id);
      const unique = new Set(ids);
      assert(unique.size).eq(ids.length, `${name} 有重复 id: ${ids}`);
    }
  });
});

runner.describe('数据加载器 DataLoader', () => {

  runner.it('应存在 window.DataLoader', () => {
    assert(window.DataLoader).object();
  });

  runner.it('应存在 6 个分组键: initials/finals/tones/characters/scenes/minimal', () => {
    assert(window.DataLoader.getAllKeys()).lengthOf(6);
    assert(new Set(window.DataLoader.getAllKeys())).eq(new Set(['initials','finals','tones','characters','scenes','minimal']));
  });

  runner.it('每个分组应有 label / icon / desc / page 元信息', () => {
    for (const key of window.DataLoader.getAllKeys()) {
      const g = window.DataLoader.GROUPS[key];
      assert(g).object();
      assert(g).hasKey('label');
      assert(g).hasKey('icon');
      assert(g).hasKey('desc');
      assert(g).hasKey('page');
      assert(g.label).string();
      assert(g.icon).string();
      assert(g.page).string();
    }
  });

  runner.it('每个分组的 page 应该以 pages/ 开头且以 .html 结尾', () => {
    for (const key of window.DataLoader.getAllKeys()) {
      const page = window.DataLoader.GROUPS[key].page;
      assert(page.startsWith('pages/')).true(`${key}.page 路径错误: ${page}`);
      assert(page.endsWith('.html')).true(`${key}.page 不是 html: ${page}`);
    }
  });

  runner.it('getData(key) 应返回正确的数据数组', () => {
    assert(window.DataLoader.getData('initials')).lengthOf(23);
    assert(window.DataLoader.getData('tones')).lengthOf(17);
    assert(window.DataLoader.getData('minimal').length).gte(5);
  });

  runner.it('getData(不存在的 key) 应返回空数组', () => {
    assert(window.DataLoader.getData('nonexistent')).eq([]);
  });

  runner.it('getGroup(key) 应返回含 items 字段的对象', () => {
    const g = window.DataLoader.getGroup('initials');
    assert(g).object();
    assert(g).hasKey('items');
    assert(g.items).array();
    assert(g.items).lengthOf(23);
  });

  runner.it('getGroup(不存在的 key) 应返回 null', () => {
    assert(window.DataLoader.getGroup('nonexistent')).null();
  });
});

runner.describe('数据跨集一致性', () => {

  runner.it('tones 的 id 格式应为 syllable-toneNumber（如 ma-1）', () => {
    for (const item of window.Data_tones) {
      assert(item.id).match(/^[a-z]+-[1-5]$/, `声调 id 格式错误: ${item.id}`);
    }
  });
});

runner.run();
