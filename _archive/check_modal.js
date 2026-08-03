// 检查 modal-overlay 当前 CSS
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

const idx = html.indexOf('.modal-overlay {');
if (idx >= 0) {
  console.log('=== 当前 .modal-overlay CSS ===');
  console.log(html.slice(idx, idx + 400));
} else {
  console.log('❌ .modal-overlay CSS 不存在！');
}

// 检查 .modal-overlay.open
const openIdx = html.indexOf('.modal-overlay.open');
console.log('\n.open:', openIdx >= 0 ? html.slice(openIdx, openIdx + 100) : '❌ 不存在');
