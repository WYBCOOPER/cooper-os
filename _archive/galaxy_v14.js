// 彻底禁用自动弹窗（夜间复盘 + 周回顾），干净截图确认星系布局
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

let n = 0;

// 1. 禁用 maybeShowReview 的调用（找到函数体里的弹窗触发）
// 之前禁用了 setTimeout，但函数可能还有其他调用点。彻底方法：给函数体加 return
const reviewFnStart = html.indexOf('function maybeShowReview() {');
if (reviewFnStart >= 0) {
  // 在函数体开头插入 return
  const insertAt = reviewFnStart + 'function maybeShowReview() {'.length;
  html = html.slice(0, insertAt) + ' return; // 已禁用自动弹窗（星系自测）' + html.slice(insertAt);
  n++;
  console.log('✅ maybeShowReview 已禁用');
}

// 2. 禁用夜间复盘自动弹（找 setTimeout 打开 review-modal）
// @130044: setTimeout(() => document.getElementById('review-modal').classList.add('open'), 800);
const oldAuto = "setTimeout(() => document.getElementById('review-modal').classList.add('open'), 800);";
if (html.includes(oldAuto)) {
  html = html.replace(oldAuto, "// 已禁用夜间复盘自动弹窗");
  n++;
  console.log('✅ 夜间复盘自动弹窗已禁用');
}

// 3. 兜底：所有 .classList.add('open') 相关 review-modal 触发检查
const trigIdx = html.indexOf("review-modal').classList.add('open')");
console.log('剩余触发点:', trigIdx >= 0 ? '⚠️ @' + trigIdx : '✅ 无');

// 4. 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);

fs.writeFileSync(path, html);
console.log('\n✅ 弹窗禁用完成（' + n + ' 处）');
