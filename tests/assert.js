/**
 * 极简断言库 — 零依赖，Node.js 直接跑
 * 风格参考 Jest / Node:assert
 */
class TestRunner {
  constructor() {
    this.suites = [];
    this.passing = 0;
    this.failing = 0;
    this.skips = 0;
    this.errors = [];
    this.currentSuite = null;
  }

  describe(name, fn) {
    this.currentSuite = { name, tests: [] };
    this.suites.push(this.currentSuite);
    fn();
    this.currentSuite = null;
  }

  it(name, fn) {
    if (!this.currentSuite) {
      console.error('it() must be inside describe()');
      process.exit(1);
    }
    this.currentSuite.tests.push({ name, fn });
  }

  skip(name, fn) {
    if (!this.currentSuite) return;
    this.currentSuite.tests.push({ name, fn, skipped: true });
  }

  async run() {
    const t0 = Date.now();
    for (const suite of this.suites) {
      console.log(`\n\x1b[36m  ${suite.name}\x1b[0m`);
      for (const test of suite.tests) {
        if (test.skipped) {
          this.skips++;
          console.log(`    \x1b[33m⏭ ${test.name}\x1b[0m`);
          continue;
        }
        try {
          await test.fn();
          this.passing++;
          console.log(`    \x1b[32m✓ ${test.name}\x1b[0m`);
        } catch (e) {
          this.failing++;
          this.errors.push({ suite: suite.name, test: test.name, error: e });
          console.log(`    \x1b[31m✗ ${test.name}\x1b[0m`);
          console.log(`      \x1b[31m${e.message}\x1b[0m`);
        }
      }
    }
    const ms = Date.now() - t0;
    console.log('');
    console.log('='.repeat(50));
    console.log(`  通过: \x1b[32m${this.passing}\x1b[0m  失败: \x1b[31m${this.failing}\x1b[0m  跳过: \x1b[33m${this.skips}\x1b[0m  (${ms}ms)`);
    if (this.errors.length > 0) {
      console.log('\n\x1b[31m失败详情:\x1b[0m');
      for (const err of this.errors) {
        console.log(`  ${err.suite} > ${err.test}`);
        console.log(`    ${err.error.stack || err.error.message}`);
      }
    }
    console.log('');
    process.exit(this.failing > 0 ? 1 : 0);
  }
}

// —— 断言 API ——
function assert(actual) {
  const api = {
    get to() { return api; },
    get be() { return api; },
    get equal() { return api; },
    get and() { return api; },
  };
  api._check = (cond, msg) => {
    if (!cond) throw new Error(msg || '断言失败');
  };
  api._eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  api.eq = (expected, msg) => {
    if (!api._eq(actual, expected)) {
      throw new Error(msg || `期望 ${JSON.stringify(expected)}, 实际 ${JSON.stringify(actual)}`);
    }
  };
  api.notEq = (expected, msg) => {
    if (api._eq(actual, expected)) {
      throw new Error(msg || `期望不等于 ${JSON.stringify(expected)}`);
    }
  };
  api.truthy = (msg) => {
    if (!actual) throw new Error(msg || `期望 truthy, 实际 ${actual}`);
  };
  api.falsy = (msg) => {
    if (actual) throw new Error(msg || `期望 falsy, 实际 ${actual}`);
  };
  api.true = (msg) => api.eq(true, msg);
  api.false = (msg) => api.eq(false, msg);
  api.null = (msg) => { if (actual !== null) throw new Error(msg || `期望 null`); };
  api.undefined = (msg) => { if (actual !== undefined) throw new Error(msg || `期望 undefined`); };
  api.string = (msg) => { if (typeof actual !== 'string') throw new Error(msg || `期望 string, 实际 ${typeof actual}`); };
  api.number = (msg) => { if (typeof actual !== 'number') throw new Error(msg || `期望 number, 实际 ${typeof actual}`); };
  api.array = (msg) => { if (!Array.isArray(actual)) throw new Error(msg || `期望 array`); };
  api.object = (msg) => { if (typeof actual !== 'object' || actual === null || Array.isArray(actual)) throw new Error(msg || `期望 object`); };
  api.lengthOf = (n, msg) => {
    if (Array.isArray(actual) || typeof actual === 'string') {
      if (actual.length !== n) throw new Error(msg || `期望长度 ${n}, 实际 ${actual.length}`);
    } else {
      const keys = Object.keys(actual);
      if (keys.length !== n) throw new Error(msg || `期望 ${n} 个键, 实际 ${keys.length}`);
    }
  };
  api.gt = (n, msg) => { if (!(actual > n)) throw new Error(msg || `期望 > ${n}, 实际 ${actual}`); };
  api.gte = (n, msg) => { if (!(actual >= n)) throw new Error(msg || `期望 >= ${n}, 实际 ${actual}`); };
  api.lt = (n, msg) => { if (!(actual < n)) throw new Error(msg || `期望 < ${n}, 实际 ${actual}`); };
  api.lte = (n, msg) => { if (!(actual <= n)) throw new Error(msg || `期望 <= ${n}, 实际 ${actual}`); };
  api.contains = (needle, msg) => {
    if (typeof actual === 'string') {
      if (!actual.includes(needle)) throw new Error(msg || `"${actual}" 不包含 "${needle}"`);
    } else if (Array.isArray(actual)) {
      if (!actual.includes(needle)) throw new Error(msg || `数组不包含 ${needle}`);
    }
  };
  api.match = (regex, msg) => {
    if (!regex.test(actual)) throw new Error(msg || `"${actual}" 不匹配 ${regex}`);
  };
  api.hasKey = (key, msg) => {
    if (!(key in actual)) throw new Error(msg || `缺少键 "${key}"`);
  };

  return api;
}

module.exports = { TestRunner, assert };
