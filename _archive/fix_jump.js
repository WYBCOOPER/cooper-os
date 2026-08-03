// 修复：中间上下两个小球点击/hover 跳动（transform 冲突）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 定位：dial-1 和 dial-4 用 translateX(-50%) 定位，hover 的 scale 覆盖了它
// 修复方案：hover 保留 translateX(-50%)，或改用 left 定位避免 transform 依赖

// 1. 查看当前 .dial:hover 定义
const hoverIdx = html.indexOf('.dial:hover');
console.log('=== 当前 .dial:hover ===');
if (hoverIdx >= 0) console.log(html.slice(hoverIdx, hoverIdx + 200));

// 2. 修复：.dial:hover 保留 translateX(-50%)
// dial-1 和 dial-4 有 translateX(-50%)，其他没有。统一 hover 不覆盖 transform：
// 方案：hover 时对 dial-1/dial-4 特殊处理
const oldHover = '.dial:hover { transform: scale(1.05); border-color: rgba(212,175,106,0.7); }';
const newHover = `.dial:hover { transform: scale(1.05); border-color: rgba(212,175,106,0.7); }
  .dial-1:hover, .dial-4:hover { transform: translateX(-50%) scale(1.05); }`;
if (html.includes(oldHover)) {
  html = html.replace(oldHover, newHover);
  console.log('✅ hover 修复：中间两个球保留 translateX');
} else {
  console.log('⚠️ .dial:hover 未精确匹配，查找变体');
  const m = html.match(/\.dial:hover\s*\{[^}]*\}/);
  if (m) console.log('实际:', m[0]);
}

// 3. 同样修复 active 状态（点击后）
const oldActive = '.dial.active { border-color: var(--accent); background: radial-gradient(circle at 35% 30%, rgba(40,32,14,0.9), rgba(14,12,8,0.95) 70%); }';
if (html.includes(oldActive)) {
  html = html.replace(oldActive, oldActive + '\n  .dial-1.active, .dial-4.active { transform: translateX(-50%); }');
  console.log('✅ active 修复');
}

// 4. 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);

fs.writeFileSync(path, html);
console.log('\n✅ 跳动修复完成');
