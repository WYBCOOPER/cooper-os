// 查看 dial-1 位置 + transform 特殊处理详情
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. 找 dial-1 位置定义（简单搜索）
console.log('=== dial-1 位置 ===');
const d1 = html.indexOf('.dial-1 {');
console.log(html.slice(d1, d1 + 200));

console.log('\n=== dial-1:hover / active 特殊处理 ===');
const h1 = html.indexOf('.dial-1:hover');
console.log(html.slice(h1, h1 + 200));
const a1 = html.indexOf('.dial-1.active');
console.log(html.slice(a1, a1 + 200));

console.log('\n=== 所有 dial 的 CSS 定位行 ===');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.dial-') && l.includes('{')) console.log(i + ': ' + l.trim());
});

console.log('\n=== .dial 基础样式 ===');
const d = html.indexOf('.dial {');
console.log(html.slice(d, d + 400));
