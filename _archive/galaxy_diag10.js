// 检查核心结构 + 找"多余圆"来源
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 1. galaxy-core HTML 结构 ===');
const coreIdx = html.indexOf('<div class="galaxy-core"');
console.log(html.slice(coreIdx, coreIdx + 700));

console.log('\n=== 2. 核心相关 CSS（core-add / core-ring / dial 位置） ===');
['.core-add', '.core-ring', '.ring-outer', '.ring-inner', '.dial-4', '.galaxy-core'].forEach(sel => {
  const idx = html.indexOf(sel + ' {');
  if (idx >= 0) console.log('\n--- ' + sel + ' ---\n' + html.slice(idx, idx + 400));
  else console.log('\n--- ' + sel + ' ❌ 未找到 ---');
});
