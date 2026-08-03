// 彻底处理：禁用所有自动弹窗 + 检查 maybeShowReview 残留触发
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. 找到 maybeShowReview 的调用点（可能有多个形式）
// 之前 replace 的是 'setTimeout(maybeShowReview, 5000);'，但 diag 显示 setTimeout(maybeShowReview 仍存在
const calls = html.match(/setTimeout\(maybeShowReview[^)]*\);/g) || [];
console.log('找到 maybeShowReview 调用:', calls.length, calls);

calls.forEach(c => {
  html = html.replace(c, '/* ' + c + ' 已禁用 */');
  console.log('✅ 禁用:', c);
});

// 2. 兜底：函数体开头加 return（前面可能已加过，检查）
if (html.includes('function maybeShowReview() { return;')) {
  console.log('✅ maybeShowReview 函数体已禁用');
} else if (html.includes('function maybeShowReview() {')) {
  html = html.replace('function maybeShowReview() {', 'function maybeShowReview() { return; // 已禁用');
  console.log('✅ maybeShowReview 函数已禁用');
}

// 3. 检查还有没有直接调用 maybeShowReview()
const directCalls = html.match(/[^a-zA-Z]maybeShowReview\(\)/g) || [];
console.log('直接调用 maybeShowReview():', directCalls.length);
if (directCalls.length) {
  directCalls.forEach(c => {
    html = html.replace(c, ' /* 已禁用 */');
  });
  console.log('✅ 已清除直接调用');
}

// 4. 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ 处理完成');
