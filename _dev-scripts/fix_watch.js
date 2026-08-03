// 修复：加重试逻辑 + 超时控制
const fs = require('fs');
const path = require('path');
const p = 'C:/Users/wyb/Desktop/草哥工作台/_dev-scripts/watch_check.js';
let s = fs.readFileSync(p, 'utf8');

// 加重试函数
const retryHelper = `
// 带重试的 fetch（网络波动容错）
async function fetchRetry(url, opts, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
      clearTimeout(t);
      return r;
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise(res => setTimeout(res, 2000 * (i + 1)));
    }
  }
}
`;

// 替换 fetch 调用
s = s.replace("const fs = require('fs');", "const fs = require('fs');\n" + retryHelper);
s = s.replace("const r = await fetch('https://api.github.com/repos/' + repo, {\n      headers: { 'User-Agent': 'watch-check' }\n    });", "const r = await fetchRetry('https://api.github.com/repos/' + repo, {\n      headers: { 'User-Agent': 'watch-check' }\n    });");

fs.writeFileSync(p, s);
console.log('✅ watch_check.js 已加重试逻辑');
