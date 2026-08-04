// 确认：今日聚焦是否有"按日期重置"逻辑
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 搜索"日期重置聚焦"的逻辑
console.log('=== 聚焦按日期重置相关 ===');
['focus_date', 'focusDate', 'cg_focus_date', 'focusDateKey', 'resetFocus', 'dailyFocus'].forEach(k => {
  const n = (html.match(new RegExp(k, 'g')) || []).length;
  console.log(k, '→', n, '处');
});

// 看 addFocus 和 toggleFocus 有没有日期逻辑
console.log('\n=== addFocus 函数 ===');
const addIdx = html.indexOf('function addFocus()');
if (addIdx >= 0) console.log(html.slice(addIdx, addIdx + 400));

console.log('\n=== 检查是否有"每天新的一天重置"代码 ===');
// 找 dateKey 或类似日期判断
const dkIdx = html.indexOf('function dateKey');
if (dkIdx >= 0) {
  console.log('dateKey 存在 @' + dkIdx);
  console.log(html.slice(dkIdx, dkIdx + 200));
}
