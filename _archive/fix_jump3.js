// 修复：学业球（dial-1）误加 translateX(-50%) 导致跳动
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. 修复 hover：dial-1 不需要 translateX(-50%)，只有 dial-4 需要
const oldHover = `.dial-1:hover, .dial-4:hover { transform: translateX(-50%) scale(1.05); }`;
const newHover = `.dial-4:hover { transform: translateX(-50%) scale(1.05); }
  .dial-1:hover { transform: scale(1.05); }`;
if (html.includes(oldHover)) {
  html = html.replace(oldHover, newHover);
  console.log('✅ dial-1 hover 已修复（去掉 translateX）');
} else {
  console.log('⚠️ hover 未匹配');
}

// 2. 修复 active：同样处理
const oldActive = `.dial-1.active, .dial-4.active { transform: translateX(-50%); }`;
const newActive = `.dial-4.active { transform: translateX(-50%); }`;
if (html.includes(oldActive)) {
  html = html.replace(oldActive, newActive);
  console.log('✅ dial-1 active 已修复');
} else {
  console.log('⚠️ active 未匹配');
}

// 3. 检查是否还有 dial-1 相关的 translateX 残留
const remain1 = html.includes('.dial-1:hover, .dial-4:hover');
const remain2 = html.includes('.dial-1.active, .dial-4.active');
console.log('残留旧规则:', remain1 || remain2 ? '⚠️ 有' : '✅ 无');

// 4. 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ 学业球跳动修复完成！');
