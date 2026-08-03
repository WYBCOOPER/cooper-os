// 关闭周回顾自动弹窗（截图干扰）+ 确认布局
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. 找到 maybeShowReview 调用并临时禁用（防止截图时弹窗遮挡）
// 保留功能但截图时跳过：把 setTimeout(maybeShowReview, 5000) 注释掉
const oldCall = 'setTimeout(maybeShowReview, 5000);';
if (html.includes(oldCall)) {
  html = html.replace(oldCall, '// setTimeout(maybeShowReview, 5000); // 临时禁用（截图自测用）');
  console.log('✅ 周回顾自动弹窗已临时禁用');
} else {
  console.log('⚠️ maybeShowReview 调用未找到，检查其他弹窗');
  // 找所有 setTimeout 里的弹窗调用
  const calls = html.match(/setTimeout\([^)]*review[^)]*\)/gi) || [];
  calls.forEach(c => console.log('  ', c));
}

// 2. 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);

fs.writeFileSync(path, html);
console.log('✅ 完成');
