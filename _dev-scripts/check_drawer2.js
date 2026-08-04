// 检查 drawer.open 和 shell 的背景
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== .drawer.open / .shell 样式 ===');
['.drawer.open', '.shell', 'body', '.shell {', 'drawer {'].forEach(k => {
  const idx = s.indexOf(k);
  if (idx >= 0) {
    const end = s.indexOf('}', idx);
    console.log(k + ': ' + s.slice(idx, end + 1).replace(/\s+/g, ' ').slice(0, 300));
  }
});

console.log('\n=== drawer 的 z-index/position ===');
const dz = s.indexOf('.drawer {');
console.log(s.slice(dz, s.indexOf('}', dz) + 1).replace(/\s+/g, ' '));

console.log('\n=== 找 .drawer.open ===');
const do2 = s.indexOf('.drawer.open');
if (do2 >= 0) console.log(s.slice(do2, s.indexOf('}', do2) + 1).replace(/\s+/g, ' '));
else console.log('未找到 .drawer.open（可能是 .open）');

// 找 .open 通用规则
const openRe = s.match(/\.drawer\.open[^{]*\{[^}]*\}/g);
if (openRe) openRe.forEach(x => console.log('OPEN: ' + x.replace(/\s+/g, ' ')));
