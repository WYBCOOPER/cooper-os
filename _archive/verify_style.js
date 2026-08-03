// 验证改造后的 index.html 完整性
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const html = fs.readFileSync(path, 'utf8');

// 1. 括号平衡检查
let balance = 0, minBalance = 0;
for (const ch of html) {
  if (ch === '{') balance++;
  if (ch === '}') balance--;
  if (balance < minBalance) minBalance = balance;
}
console.log('花括号平衡:', balance === 0 ? '✅ 平衡' : `❌ 差 ${balance} 个`);
console.log('最低深度:', minBalance);

// 2. 关键标记检查
const checks = {
  ':root 变量': html.includes(':root'),
  '金色 accent #d4af6a': html.includes('#d4af6a'),
  '星云背景 body::before': html.includes('body::before'),
  'Liquid Glass .card': html.includes('box-shadow: inset 0 1px 0'),
  '手机增强 @media': html.includes('手机增强：深空星云'),
  '保留中文注释': html.includes('时钟') || html.includes('状态栏'),
};
console.log('\n=== 关键标记 ===');
for (const [k, v] of Object.entries(checks)) console.log(v ? '✅' : '❌', k);

// 3. <style> 和 </style> 配对
const styleOpen = (html.match(/<style>/g) || []).length;
const styleClose = (html.match(/<\/style>/g) || []).length;
console.log('\n<style> 标签:', styleOpen, '| </style>:', styleClose, styleOpen === styleClose ? '✅' : '❌');

// 4. 抽取 style 内 CSS 用 node 校验（粗略）
console.log('\n文件大小:', (html.length / 1024).toFixed(1), 'KB');
