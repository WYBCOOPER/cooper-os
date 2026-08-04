// 检查抽屉面板的背景样式
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== 抽屉容器样式 ===');
['drawer', 'drawer-panel', 'drawer-overlay', 'drawer-bg'].forEach(k => {
  const re = new RegExp('\\.' + k + '\\s*\\{[^}]*\\}');
  const m = re.exec(s);
  if (m) console.log('.' + k + ': ' + m[0].replace(/\s+/g, ' ').slice(0, 250));
});

console.log('\n=== 找所有 .drawer 开头类名 ===');
const names = new Set();
const re2 = /\.drawer[a-z-]*/g;
let m2;
while ((m2 = re2.exec(s)) !== null) names.add(m2[0]);
console.log([...names].join(', '));

console.log('\n=== drawer 面板 HTML ===');
const d1 = s.indexOf('id="d1"');
console.log(s.slice(d1 - 400, d1 + 100).replace(/\s+/g, ' ').slice(0, 600));
