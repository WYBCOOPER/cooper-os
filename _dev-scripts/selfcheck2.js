// 恢复功能 + 全面自检
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== 1. 主界面 DDL 展示在哪 ===');
// 找 deck-ddl 或主界面 ddl
const ddlHtml = s.indexOf('core-ddl');
const ddl2 = s.indexOf('deck-ddl');
console.log('core-ddl HTML @', ddlHtml);
console.log('deck-ddl HTML @', ddl2);
if (ddl2 >= 0) console.log('deck-ddl 上下文:', s.slice(ddl2 - 200, ddl2 + 300).replace(/\s+/g, ' ').slice(0, 500));

console.log('\n=== 2. 主界面今日聚焦展示 ===');
const deckFocus = s.indexOf('deck-focus');
console.log('deck-focus @', deckFocus);

console.log('\n=== 3. 7 个抽屉是否存在 ===');
['d1','d2','d3','d4','d5','d6','d7'].forEach(id => {
  const i = s.indexOf('id="' + id + '"');
  console.log(id + ': ' + (i >= 0 ? '✅ @' + i : '❌'));
});

console.log('\n=== 4. 我的覆盖 CSS 中 display:none 的项 ===');
const cssStart = s.lastIndexOf('/* ===== 月亮圆盘精简');
const cssEnd = s.indexOf('</style>', cssStart);
if (cssStart > 0) {
  const css = s.slice(cssStart, cssEnd);
  const hides = css.match(/\.core-[a-z-]+\s*\{\s*display:\s*none/g);
  console.log(hides ? hides.join('\n') : '无');
}
