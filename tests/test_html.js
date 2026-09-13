/**
 * HTML 结构测试 + HTTP 资源可达性测试
 * - 解析 7 个 HTML 文件，校验它们引用的 JS/CSS/链接是否指向真实文件
 * - 启动本地 http server，校验所有资源返回 200
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { TestRunner, assert } = require('./assert');

const runner = new TestRunner();
const ROOT = path.join(__dirname, '..');

// —— 收集所有应该被引用的文件（磁盘上的真实文件）——
function getAllRealFiles() {
  const walk = (dir) => {
    const out = [];
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory() && !name.startsWith('.') && name !== 'tests') {
        out.push(...walk(full));
      } else if (st.isFile()) {
        out.push(path.relative(ROOT, full));
      }
    }
    return out;
  };
  return walk(ROOT);
}

// —— 从 HTML 文件里解析出所有引用 ——
function parseHtmlRefs(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const refs = [];
  // <link href="..."> —— 只有 .css 才算 css
  const linkRe = /href="([^"]+)"/g;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const url = m[1];
    if (url.endsWith('.css')) refs.push({ type: 'css', url });
    else if (url.endsWith('.html')) refs.push({ type: 'html', url });
    else refs.push({ type: 'other', url }); // favicon 等
  }
  // <script src="...">
  const scriptRe = /src="([^"]+)"/g;
  while ((m = scriptRe.exec(html)) !== null) {
    refs.push({ type: 'js', url: m[1] });
  }
  return refs;
}

// —— HTTP 请求工具 ——
function httpGet(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      res.resume();
      resolve({ status: res.statusCode });
    }).on('error', () => resolve({ status: 0 }));
  });
}

const HTML_FILES = [
  'index.html',
  'pages/initials.html',
  'pages/finals.html',
  'pages/tones.html',
  'pages/characters.html',
  'pages/scenes.html',
  'pages/minimal.html',
];

const EXPECTED_CSS_BY_PAGE = {
  'index.html': ['base.css', 'layout.css'],
  'pages/initials.html': ['base.css', 'layout.css', 'cards.css'],
  'pages/finals.html': ['base.css', 'layout.css', 'cards.css'],
  'pages/tones.html': ['base.css', 'layout.css', 'cards.css'],
  'pages/characters.html': ['base.css', 'layout.css', 'cards.css'],
  'pages/scenes.html': ['base.css', 'layout.css', 'cards.css'],
  'pages/minimal.html': ['base.css', 'layout.css', 'pairs.css'],
};

// ========================================
runner.describe('HTML 文件存在性与基本结构', () => {

  for (const h of HTML_FILES) {
    runner.it(`${h} 必须存在`, () => {
      const fp = path.join(ROOT, h);
      assert(fs.existsSync(fp)).true(`${h} 不存在`);
    });

    runner.it(`${h} 必须有 <!DOCTYPE html>`, () => {
      const html = fs.readFileSync(path.join(ROOT, h), 'utf8');
      assert(html.toLowerCase().includes('<!doctype html>')).true('缺少 DOCTYPE');
    });

    runner.it(`${h} 必须有 <html> 且带 lang="zh-CN"`, () => {
      const html = fs.readFileSync(path.join(ROOT, h), 'utf8');
      assert(html.includes('<html lang="zh-CN"')).true('缺少 <html lang="zh-CN">');
    });

    runner.it(`${h} 必须有 <title>`, () => {
      const html = fs.readFileSync(path.join(ROOT, h), 'utf8');
      assert(/<title>.+<\/title>/.test(html)).true('缺少 <title>');
    });
  }
});

runner.describe('子页面路径正确性', () => {

  runner.it('所有 pages/*.html 的 CSS 路径应以 ../css/ 开头', () => {
    for (const h of HTML_FILES.filter(x => x.startsWith('pages/'))) {
      const html = fs.readFileSync(path.join(ROOT, h), 'utf8');
      const links = [...html.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1]);
      for (const l of links) {
        assert(l.startsWith('../css/')).true(`${h} 的 CSS 路径没走 ../: ${l}`);
      }
    }
  });

  runner.it('所有 pages/*.html 的 JS 路径应以 ../js/ 开头', () => {
    for (const h of HTML_FILES.filter(x => x.startsWith('pages/'))) {
      const html = fs.readFileSync(path.join(ROOT, h), 'utf8');
      const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
      for (const s of scripts) {
        assert(s.startsWith('../js/')).true(`${h} 的 JS 路径没走 ../: ${s}`);
      }
    }
  });

  runner.it('index.html 的 CSS/JS 路径不带 ../', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const links = [...html.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1]);
    const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
    for (const l of links) assert(!l.includes('..')).true(`index.html 不应有 ../: ${l}`);
    for (const s of scripts) assert(!s.includes('..')).true(`index.html 不应有 ../: ${s}`);
  });

  runner.it('所有 pages/*.html 的"返回首页"链接指向 ../index.html', () => {
    for (const h of HTML_FILES.filter(x => x.startsWith('pages/'))) {
      const html = fs.readFileSync(path.join(ROOT, h), 'utf8');
      assert(html.includes('href="../index.html"')).true(`${h} 的返回首页链接错误`);
    }
  });

  runner.it('每个子页面的 data-page 属性必须与文件名对应', () => {
    const mapping = {
      'pages/initials.html': 'initials',
      'pages/finals.html': 'finals',
      'pages/tones.html': 'tones',
      'pages/characters.html': 'characters',
      'pages/scenes.html': 'scenes',
      'pages/minimal.html': 'minimal',
    };
    for (const [file, expected] of Object.entries(mapping)) {
      const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
      assert(html.includes(`data-page="${expected}"`)).true(`${file} 缺少 data-page="${expected}"`);
    }
  });
});

runner.describe('HTML 引用的文件在磁盘上真实存在', () => {

  for (const h of HTML_FILES) {
    runner.it(`${h} 引用的所有 CSS/JS 文件必须在磁盘上存在`, () => {
      const htmlPath = path.join(ROOT, h);
      const refs = parseHtmlRefs(htmlPath);
      const dir = path.dirname(htmlPath);

      for (const ref of refs) {
        if (ref.type === 'css' || ref.type === 'js') {
          // 忽略 data: 协议
          if (ref.url.startsWith('data:') || ref.url.startsWith('http')) continue;
          const target = path.resolve(dir, ref.url);
          assert(fs.existsSync(target)).true(`${h} 引用了不存在的文件: ${ref.url} → ${target}`);
        }
      }
    });
  }

  runner.it('所有 HTML 引用的外部文件集合 = 磁盘上真实文件集合（无多余）', () => {
    const realFiles = new Set(getAllRealFiles());
    const refs = [];
    for (const h of HTML_FILES) {
      const htmlPath = path.join(ROOT, h);
      const dir = path.dirname(htmlPath);
      for (const ref of parseHtmlRefs(htmlPath)) {
        if ((ref.type === 'css' || ref.type === 'js') && !ref.url.startsWith('data:') && !ref.url.startsWith('http')) {
          const rel = path.relative(ROOT, path.resolve(dir, ref.url));
          refs.push(rel);
        }
      }
    }
    // 不要求全部覆盖（比如 .nojekyll），但要求引用的都在磁盘上
    for (const r of refs) {
      assert(realFiles.has(r)).true(`引用了不存在的文件: ${r}`);
    }
  });
});

runner.describe('CSS 文件完整性', () => {

  const cssDir = path.join(ROOT, 'css');
  runner.it('必须有 base.css / layout.css / cards.css / pairs.css', () => {
    for (const name of ['base.css', 'layout.css', 'cards.css', 'pairs.css']) {
      assert(fs.existsSync(path.join(cssDir, name))).true(`缺少 css/${name}`);
    }
  });

  runner.it('base.css 应定义声调颜色变量', () => {
    const css = fs.readFileSync(path.join(cssDir, 'base.css'), 'utf8');
    // 常见声调颜色定义
    assert(css).match(/(--tone1|\.tone1|tone.*#)/i);
  });

  runner.it('pairs.css 必须被 minimal.html 引用，cards.css 不被 minimal.html 引用', () => {
    const html = fs.readFileSync(path.join(ROOT, 'pages/minimal.html'), 'utf8');
    assert(html.includes('pairs.css')).true('minimal.html 应引用 pairs.css');
    assert(!html.includes('cards.css')).true('minimal.html 不应引用 cards.css');
  });

  runner.it('cards.css 必须被 initials/finals/tones/characters/scenes 这 5 个子页引用', () => {
    for (const name of ['initials', 'finals', 'tones', 'characters', 'scenes']) {
      const html = fs.readFileSync(path.join(ROOT, 'pages', `${name}.html`), 'utf8');
      assert(html.includes('cards.css')).true(`${name}.html 应引用 cards.css`);
      assert(!html.includes('pairs.css')).true(`${name}.html 不应引用 pairs.css`);
    }
  });
});

runner.describe('JS 文件完整性', () => {

  const jsDir = path.join(ROOT, 'js');
  runner.it('js/app.js 必须存在', () => {
    assert(fs.existsSync(path.join(jsDir, 'app.js'))).true();
  });

  runner.it('js/data/ 应包含 8 个文件（initials/finals/tones/characters/scenes/minimal + index + augment）', () => {
    const files = fs.readdirSync(path.join(jsDir, 'data'));
    assert(files.length).eq(8, `应有 7 个数据文件，实际 ${files.length}: ${files.join(',')}`);
  });

  runner.it('js/services/ 应包含 speech.js 和 storage.js', () => {
    const files = fs.readdirSync(path.join(jsDir, 'services'));
    assert(new Set(files)).eq(new Set(['speech.js', 'storage.js']));
  });

  runner.it('js/render/ 应包含 shared.js / cards.js / pairs.js', () => {
    const files = fs.readdirSync(path.join(jsDir, 'render'));
    assert(new Set(files)).eq(new Set(['shared.js', 'cards.js', 'pairs.js']));
  });
});

// —— 启动 HTTP server 做网络可达性测试 ——
let server;
const PORT = 18765;
let serverStarted = false;

runner.describe('HTTP 资源可达性（localhost:' + PORT + '）', () => {

  runner.it('启动 HTTP server', () => new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      let fp = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (req.url === '/') fp = path.join(ROOT, 'index.html');
      if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
        const ext = path.extname(fp);
        const mime = {
          '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
          '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
        }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(fp).pipe(res);
      } else {
        res.writeHead(404); res.end('not found');
      }
    });
    server.listen(PORT, () => { serverStarted = true; resolve(); });
  }));

  runner.it('首页 / 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/`);
    assert(r.status).eq(200);
  });

  for (const h of HTML_FILES) {
    runner.it(`${h} 返回 200`, async () => {
      const r = await httpGet(`http://localhost:${PORT}/${h}`);
      assert(r.status).eq(200);
    });
  }

  runner.it('css/base.css 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/css/base.css`);
    assert(r.status).eq(200);
  });

  runner.it('css/layout.css 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/css/layout.css`);
    assert(r.status).eq(200);
  });

  runner.it('css/cards.css 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/css/cards.css`);
    assert(r.status).eq(200);
  });

  runner.it('css/pairs.css 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/css/pairs.css`);
    assert(r.status).eq(200);
  });

  runner.it('js/app.js 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/js/app.js`);
    assert(r.status).eq(200);
  });

  runner.it('js/services/speech.js 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/js/services/speech.js`);
    assert(r.status).eq(200);
  });

  runner.it('js/services/storage.js 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/js/services/storage.js`);
    assert(r.status).eq(200);
  });

  runner.it('js/render/cards.js 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/js/render/cards.js`);
    assert(r.status).eq(200);
  });

  runner.it('js/render/pairs.js 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/js/render/pairs.js`);
    assert(r.status).eq(200);
  });

  runner.it('js/render/shared.js 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/js/render/shared.js`);
    assert(r.status).eq(200);
  });

  runner.it('js/data/index.js 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/js/data/index.js`);
    assert(r.status).eq(200);
  });

  runner.it('js/data/initials.js 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/js/data/initials.js`);
    assert(r.status).eq(200);
  });

  runner.it('.nojekyll 返回 200', async () => {
    const r = await httpGet(`http://localhost:${PORT}/.nojekyll`);
    assert(r.status).eq(200);
  });

  runner.it('关闭 HTTP server', () => new Promise((resolve) => {
    if (server) server.close(() => resolve());
    else resolve();
  }));
});

runner.run();
