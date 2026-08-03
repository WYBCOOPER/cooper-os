// 验证新设计系统完整性
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const html = fs.readFileSync(path, 'utf8');

// 1. 括号平衡
let balance = 0, minBalance = 0;
for (const ch of html) {
  if (ch === '{') balance++;
  if (ch === '}') balance--;
  if (balance < minBalance) minBalance = balance;
}
console.log('花括号平衡:', balance === 0 ? '✅' : `❌ ${balance}`);

// 2. 关键设计元素
const checks = {
  '深空黑 --bg: #05060a': html.includes('--bg: #05060a'),
  '金色 accent #d4af6a': html.includes('--accent: #d4af6a'),
  'Liquid Glass 卡片': html.includes('box-shadow: inset 0 1px 0'),
  '星云动画 nebulaDrift': html.includes('nebulaDrift'),
  '错峰卡片动画 cardIn': html.includes('cardIn'),
  '手机底部 Tab': html.includes('position: fixed; bottom: 0'),
  't-emoji 图标拆分': html.includes('t-emoji'),
  '模态框动画 modalUp': html.includes('modalUp'),
};
console.log('\n=== 设计系统检查 ===');
for (const [k, v] of Object.entries(checks)) console.log(v ? '✅' : '❌', k);

// 3. style 标签配对
const so = (html.match(/<style>/g) || []).length;
const sc = (html.match(/<\/style>/g) || []).length;
console.log('\n<style>:', so, '| </style>:', sc, so === sc ? '✅' : '❌');

// 4. 关键 JS 是否保留
const jsChecks = ['openDrawer', 'renderFocus', 'addFocus', 'localStorage', 'saveAll', 'renderSchedule'];
console.log('\n=== JS 功能保留 ===');
jsChecks.forEach(f => console.log(html.includes(f) ? '✅' : '❌', f));
