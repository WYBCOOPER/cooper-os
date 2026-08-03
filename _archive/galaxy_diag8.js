// 彻底禁用周回顾弹窗：检查 review-modal 初始状态 + 所有触发点
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. 找 review-modal 的定义和初始状态
const rmIdx = html.indexOf('review-modal');
console.log('=== review-modal 区域 ===');
console.log(html.slice(rmIdx - 200, rmIdx + 600));

// 2. 找 review-modal 的 HTML 元素
const rmHtml = html.indexOf('review-modal"');
if (rmHtml > 0) {
  console.log('\n=== review-modal HTML ===');
  console.log(html.slice(rmHtml - 100, rmHtml + 300));
}

// 3. 找打开 modal 的 JS（classList.add('open') 或 show）
['review-modal'].forEach(k => {
  let idx = 0;
  while ((idx = html.indexOf(k, idx)) >= 0) {
    const ctx = html.slice(Math.max(0, idx - 50), idx + 80).replace(/\n/g, ' ');
    if (ctx.includes('classList') || ctx.includes('style.') || ctx.includes('display')) {
      console.log('\nJS 操作 @' + idx + ': ' + ctx);
    }
    idx += k.length;
  }
});
