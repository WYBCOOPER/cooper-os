// 排查：① 喝水打卡 ② "输入+取消+确定"弹窗 ③ 板块完整性
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 1. modal-overlay 默认隐藏检查（弹窗卡死根源）===');
const modalIdx = html.indexOf('.modal-overlay {');
if (modalIdx >= 0) {
  const block = html.slice(modalIdx, modalIdx + 300);
  const hasDisplayNone = /display:\s*none/.test(block);
  console.log(hasDisplayNone ? '✅ modal 默认隐藏' : '❌❌ modal 没有 display:none！这是弹窗卡死根源！');
  console.log(block.slice(0, 200));
} else {
  console.log('❌ 找不到 .modal-overlay CSS');
}

console.log('\n=== 2. 喝水打卡功能 ===');
['cg_water', 'water', 'renderWater', '喝水'].forEach(k => {
  const n = (html.match(new RegExp(k, 'g')) || []).length;
  console.log(k, '→', n, '处', n > 0 ? '✅' : '❌');
});

console.log('\n=== 3. 板块完整性 ===');
['d1','d2','d3','d4','d5','d6','d7'].forEach(d => {
  console.log('id="' + d + '"', html.includes('id="' + d + '"') ? '✅' : '❌');
});

console.log('\n=== 4. 可疑的"输入+取消+确定"弹窗 ===');
// 找 modal 的 HTML 结构
const modalHtml = html.indexOf('id="modal-overlay"');
if (modalHtml >= 0) {
  console.log('modal-overlay HTML @' + modalHtml);
  console.log(html.slice(modalHtml, modalHtml + 400));
}

console.log('\n=== 5. 上次修改是否动了这些？ ===');
// 检查水卡/饮水代码里有没有 openModal 调用
const wIdx = html.indexOf('cg_water');
if (wIdx >= 0) {
  const around = html.slice(Math.max(0, wIdx - 300), wIdx + 200);
  if (around.includes('openModal')) console.log('⚠️ 喝水打卡用了 openModal');
}
