// 核实：core-add 实际样式 + 7 处 backdrop-filter 位置
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== 1. core-add 所有相关 CSS ===');
const re = /\.core-add\s*\{[^}]*\}/g;
let m;
while ((m = re.exec(s)) !== null) {
  console.log(m[0].replace(/\s+/g, ' ').slice(0, 200));
}

console.log('\n=== 2. backdrop-filter 位置（7处）===');
const bf = /[^{}]*\{[^}]*backdrop-filter:[^}]*\}/g;
let b, i = 0;
while ((b = bf.exec(s)) !== null && i < 10) {
  const sel = b[0].split('{')[0].trim();
  console.log((i+1) + '. ' + sel.slice(0, 80));
  i++;
}

console.log('\n=== 3. 我的覆盖 CSS 中 core-add ===');
const overIdx = s.indexOf('恢复 ＋今日聚焦');
if (overIdx > 0) {
  console.log(s.slice(overIdx - 30, overIdx + 200).replace(/\s+/g, ' '));
}
