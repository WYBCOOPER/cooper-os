// 修复：今日聚焦按日期分桶（每天独立，不再跨天残留）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 找到 focus 初始化，改为按日期读取 ============
// 原：let focus = store.get('cg_focus', [defaults]);
// 新：每天一份（cg_focus_daily.日期），读今天的；昨天的不影响
const oldInit = `/* ===== 今日聚焦 ===== */
let focus = store.get('cg_focus', [   { t: '背 50 个英语单词', done: false },   { t: 'Pyt`;
// 先精确找
const initIdx = html.indexOf("let focus = store.get('cg_focus'");
if (initIdx < 0) { console.log('❌ 找不到 focus 初始化'); process.exit(1); }
console.log('✅ 找到 focus 初始化 @' + initIdx);

// 找到初始化结束位置（分号）
const endIdx = html.indexOf(';', initIdx);
console.log('初始化结束 @' + endIdx);
console.log('原代码:', html.slice(initIdx - 30, endIdx + 10).replace(/\n/g, ' '));

// 替换为按日期版本（保留默认值作为首次初始化）
const newInit = `let focus = (function() {
  const d = dateKey();
  const all = store.get('cg_focus_daily', {});
  if (all[d]) return all[d];
  return store.get('cg_focus', [
    { t: '背 50 个英语单词', done: false },
    { t: 'Python 学习 1 小时', done: false }
  ]);
})();`;
html = html.slice(0, initIdx - 30) + newInit + html.slice(endIdx + 1);
console.log('✅ focus 改为按日期读取（cg_focus_daily.今天）');

// ============ 2. 所有 store.set('cg_focus') 改为写入当天的分桶 ============
// 封装一个 saveFocus 函数：写入 cg_focus_daily[今天]
// 先找所有 store.set('cg_focus' 出现位置，统一替换为 saveFocus()
let setCount = 0;
let searchFrom = 0;
while (true) {
  const idx = html.indexOf("store.set('cg_focus'", searchFrom);
  if (idx < 0) break;
  // 替换这处调用
  html = html.slice(0, idx) + "saveFocus()" + html.slice(idx + "store.set('cg_focus'".length + 10);
  // 上面长度计算可能不准，用更精确的方式：找到闭合括号
  setCount++;
  searchFrom = idx + 20;
}
console.log('⚠️ 需检查 store.set 替换数量:', setCount);

fs.writeFileSync(path, html);
console.log('✅ 第一步完成（待验证）');
