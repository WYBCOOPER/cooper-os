// 紧急修复：恢复 maybeShowReview 函数名
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 找到损坏的函数定义
const broken1 = 'function /* 已禁用?*/ { return; // 已禁用自动弹窗（星系自测）';
const broken2 = 'function /* 已禁用*/ { return; // 已禁用自动弹窗（星系自测）';
const broken3 = 'function /* 已禁用?*/ {';
const broken4 = 'function /* 已禁用*/ {';
const broken5 = 'function /*';

console.log('=== 搜索损坏的函数定义 ===');
const candidates = html.match(/function\s*\/\*[^*]*\*\/\s*\{/g) || [];
console.log('找到损坏定义:', candidates.length, candidates);

// 修复所有损坏的函数定义：恢复为 maybeShowReview
let fixed = 0;
candidates.forEach(c => {
  const fixedFn = 'function maybeShowReview() { return; // 已禁用';
  if (html.includes(c)) {
    html = html.split(c).join(fixedFn);
    fixed++;
  }
});
console.log('已修复:', fixed, '处');

// 再全局检查是否有 function /* 残留
const remain = html.match(/function\s*\/\*/g) || [];
console.log('残留:', remain.length);

// 校验括号
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ 修复完成！');
