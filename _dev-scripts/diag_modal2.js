// 排查："输入+取消+确定"弹窗为什么出现在每个板块底部
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. modal-overlay 的 CSS（默认应隐藏）
const mIdx = html.indexOf('.modal-overlay {');
console.log('=== modal-overlay CSS ===');
console.log(html.slice(mIdx, mIdx + 250));

// 2. 找所有 openModal 调用（哪些功能会弹这个"输入"框）
console.log('\n=== openModal 调用点 ===');
let idx = 0, count = 0;
while ((idx = html.indexOf("openModal(", idx)) >= 0 && count < 20) {
  const ctx = html.slice(Math.max(0, idx - 60), idx + 80).replace(/\n/g, ' ');
  console.log('@' + idx + ': ' + ctx.slice(0, 130));
  idx += 10; count++;
}

// 3. modal-title 默认值"输入"
console.log('\n=== modal-title 默认 ===');
const tIdx = html.indexOf('id="modal-title"');
console.log(html.slice(tIdx - 30, tIdx + 60));
