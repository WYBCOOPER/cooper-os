// 列出所有 store.set('cg_focus' 调用点（确认形式）
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

let idx = 0, count = 0;
while ((idx = html.indexOf("store.set('cg_focus'", idx)) >= 0 && count < 15) {
  const ctx = html.slice(idx, idx + 40).replace(/\n/g, ' ');
  console.log('@' + idx + ': ' + ctx);
  idx += 20; count++;
}
console.log('\n总调用数:', count);

// 也看看 cg_focus_linked 是什么（绑定追踪防重复的）
const li = html.indexOf('cg_focus_linked');
if (li >= 0) console.log('\ncg_focus_linked 用途:', html.slice(li - 30, li + 80).replace(/\n/g, ' '));
