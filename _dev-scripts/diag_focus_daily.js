// 排查：今日聚焦为什么不每天更新
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. 找 cg_focus 的存储和重置逻辑
console.log('=== cg_focus 相关代码 ===');
let idx = 0, count = 0;
while ((idx = html.indexOf('cg_focus', idx)) >= 0 && count < 20) {
  const ctx = html.slice(Math.max(0, idx - 60), idx + 60).replace(/\n/g, ' ');
  console.log('@' + idx + ': ' + ctx);
  idx += 8; count++;
}

// 2. 找 focus 变量初始化
console.log('\n=== focus 变量定义 ===');
const fIdx = html.indexOf('let focus');
if (fIdx >= 0) console.log(html.slice(fIdx - 50, fIdx + 100));
