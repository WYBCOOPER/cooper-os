// 排查：① 顶栏遮挡 ② 聚焦完成/删除 ③ 回归测试准备
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. 顶栏 + galaxy 布局
console.log('=== 1. 顶栏与星系布局 ===');
const sb = html.match(/\.statusbar\s*\{[^}]*\}/);
console.log('statusbar:', sb ? sb[0] : '❌');
const gl = html.match(/\.galaxy\s*\{[^}]*\}/);
console.log('galaxy:', gl ? gl[0] : '❌');
const d4 = html.match(/\.dial-4\s*\{[^}]*\}/);
console.log('dial-4:', d4 ? d4[0] : '❌');
const d1 = html.match(/\.dial-1\s*\{[^}]*\}/);
console.log('dial-1:', d1 ? d1[0] : '❌');
const d2 = html.match(/\.dial-2\s*\{[^}]*\}/);
console.log('dial-2:', d2 ? d2[0] : '❌');

// 2. 聚焦完成/删除逻辑
console.log('\n=== 2. 今日聚焦逻辑 ===');
// 找 toggleFocus / 完成聚焦的函数
['toggleFocus', 'markFocus', 'doneFocus', 'delFocus', 'removeFocus', 'fc-item'].forEach(k => {
  const n = (html.match(new RegExp(k, 'g')) || []).length;
  console.log(k, '→', n, '处');
});

// 找 deck-focus 渲染函数（原版）
const dfIdx = html.indexOf('deck-focus');
console.log('\n=== renderFocus 函数 ===');
const rfIdx = html.indexOf('function renderFocus');
if (rfIdx >= 0) console.log(html.slice(rfIdx, rfIdx + 1200));
