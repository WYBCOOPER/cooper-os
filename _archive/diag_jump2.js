// 查学业小球（dial-1）点击跳动原因
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 1. 所有 dial 位置定义 ===');
['dial-1','dial-2','dial-3','dial-4','dial-5','dial-6','dial-7'].forEach(c => {
  const m = html.match(new RegExp('\\\\.' + c + ' \\\\{[^}]*\\\\}'));
  if (m) console.log(c, '→', m[0].replace(/\n/g, ' '));
});

console.log('\n=== 2. .dial:hover / .dial.active ===');
const h = html.match(/\.dial:hover\s*\{[^}]*\}/g);
h.forEach(x => console.log('hover:', x.replace(/\n/g, ' ')));
const a = html.match(/\.dial\.active\s*\{[^}]*\}/g);
a.forEach(x => console.log('active:', x.replace(/\n/g, ' ')));

console.log('\n=== 3. openDrawer 函数 ===');
const od = html.indexOf('function openDrawer');
console.log(html.slice(od, od + 400));

console.log('\n=== 4. dial-1/dial-4 的 transform 特殊处理 ===');
['dial-1:hover', 'dial-4:hover', 'dial-1.active', 'dial-4.active'].forEach(k => {
  console.log(k, html.includes(k) ? '✅ 有特殊处理' : '⚠️ 无');
});
