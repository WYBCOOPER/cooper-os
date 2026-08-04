// 修复 v2：今日聚焦按日期分桶（完整版）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. focus 初始化：按日期读取 ============
// 原: let focus = store.get('cg_focus', [defaults]);
// 找确切的初始化块
const initStart = html.indexOf('/* ===== 今日聚焦 ===== */');
if (initStart < 0) { console.log('❌ 找不到今日聚焦注释'); process.exit(1); }

// 从注释后找到 let focus 到分号
const letIdx = html.indexOf('let focus = store.get', initStart);
if (letIdx < 0) { console.log('❌ 找不到 let focus'); process.exit(1); }
const semiIdx = html.indexOf(';', letIdx);

const oldInit = html.slice(letIdx, semiIdx + 1);
console.log('原初始化:', oldInit.replace(/\n/g, ' ').slice(0, 150));

const newInit = `let focus = (function() {
  const d = dateKey();
  try {
    const all = store.get('cg_focus_daily', {});
    if (Array.isArray(all[d])) return all[d];
  } catch(e) {}
  return store.get('cg_focus', [
    { t: '背 50 个英语单词', done: false },
    { t: 'Python 学习 1 小时', done: false }
  ]);
})();`;

html = html.slice(0, letIdx) + newInit + html.slice(semiIdx + 1);
console.log('✅ 初始化改为按日期读取');

// ============ 2. 在 dateKey 函数后插入 saveFocus 函数 ============
// 找 dateKey 函数定义位置，在其后插入 saveFocus
const dkIdx = html.indexOf('function dateKey()');
if (dkIdx < 0) { console.log('❌ 找不到 dateKey'); process.exit(1); }
const dkEnd = html.indexOf('}', dkIdx) + 1;

const saveFocusFn = `

/* 保存今日聚焦：写入当天分桶（每天独立） */
function saveFocus() {
  try {
    const d = dateKey();
    const all = store.get('cg_focus_daily', {});
    all[d] = JSON.parse(JSON.stringify(focus));
    store.set('cg_focus_daily', all);
  } catch(e) {}
  store.set('cg_focus', focus); // 兼容旧版读取
}`;

html = html.slice(0, dkEnd) + saveFocusFn + html.slice(dkEnd);
console.log('✅ saveFocus() 函数已插入');

// ============ 3. 6 处 store.set('cg_focus', focus) → saveFocus() ============
// 精确替换（注意有的带空格有的不带）
const patterns = [
  "store.set('cg_focus', focus)",
  "store.set('cg_focus',focus)"
];
let replaced = 0;
patterns.forEach(p => {
  let idx = 0;
  while ((idx = html.indexOf(p, idx)) >= 0) {
    html = html.slice(0, idx) + 'saveFocus()' + html.slice(idx + p.length);
    replaced++;
    idx += 12;
  }
});
console.log('✅ 替换了', replaced, '处 store.set → saveFocus()');

// ============ 4. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

// 检查残留
const remain = html.match(/store\.set\('cg_focus'/g) || [];
console.log('残留 store.set(cg_focus):', remain.length, '处');
// 检查 cg_focus_daily 出现次数（应 >= 4）
const daily = (html.match(/cg_focus_daily/g) || []).length;
console.log('cg_focus_daily 出现:', daily, '处');

fs.writeFileSync(path, html);
console.log('\n✅ 修复完成！大小:', (html.length / 1024).toFixed(1), 'KB');
