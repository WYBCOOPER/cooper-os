// 排查：网页版为什么删打卡数据
const fs = require('fs');

// 1. 看同步逻辑（IS_SERVER / /api/save / /api/load 的调用）
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');
console.log('=== 同步相关代码 ===');
['IS_SERVER', '/api/save', '/api/load', '轮询', 'sync', 'setInterval'].forEach(k => {
  const n = (html.match(new RegExp(k, 'g')) || []).length;
  console.log(k, '→', n, '处');
});

// 2. 找 IS_SERVER 判断
const isIdx = html.indexOf('IS_SERVER');
console.log('\n=== IS_SERVER 定义 ===');
if (isIdx >= 0) console.log(html.slice(isIdx - 200, isIdx + 300));

// 3. 找数据同步函数（可能覆盖 localStorage）
const syncIdx = html.indexOf('function sync');
console.log('\n=== sync 函数 ===');
if (syncIdx >= 0) console.log(html.slice(syncIdx, syncIdx + 800));

// 4. 找轮询逻辑
const pollIdx = html.indexOf('setInterval');
console.log('\n=== setInterval 调用 ===');
let idx = 0, count = 0;
while ((idx = html.indexOf('setInterval', idx)) >= 0 && count < 10) {
  console.log('@' + idx + ': ' + html.slice(idx, idx + 120).replace(/\n/g, ' '));
  idx += 11; count++;
}
