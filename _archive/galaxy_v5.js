// 星系核心聚焦精简显示 v5：小胶囊样式，可点击展开完整列表
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 精简聚焦样式（替换核心内 .core-focus 样式） ============
const oldFocusCSS = `.core-focus { margin-top: 6px; font-size: clamp(11px, 1.4vw, 13px); color: var(--text); max-width: 88%; }
  .core-focus .fc-item { background: rgba(212,175,106,0.08); border: 1px solid rgba(212,175,106,0.22); border-radius: 8px; padding: 3px 10px; margin: 3px auto; width: fit-content; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`;
const newFocusCSS = `.core-focus { margin-top: 6px; font-size: clamp(10px, 1.2vw, 12px); color: var(--text); max-width: 92%; display: flex; flex-direction: column; gap: 4px; align-items: center; width: 100%; }
  .core-focus .fc-item { background: rgba(212,175,106,0.10); border: 1px solid rgba(212,175,106,0.25); border-radius: 20px; padding: 3px 12px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; transition: all .2s var(--ease); }
  .core-focus .fc-item:hover { background: rgba(212,175,106,0.2); transform: scale(1.03); }
  .core-focus .fc-item.done { opacity: .45; text-decoration: line-through; }
  .core-focus .fc-more { color: var(--text-faint); font-size: clamp(8px, 1vw, 10px); letter-spacing: .1em; }`;
if (html.includes(oldFocusCSS)) {
  html = html.replace(oldFocusCSS, newFocusCSS);
  console.log('✅ 核心聚焦改为小胶囊样式');
} else {
  console.log('⚠️ 聚焦 CSS 未精确匹配，尝试兜底');
  html = html.replace('.core-focus { margin-top: 6px;', '.core-focus { margin-top: 6px; font-size: clamp(10px, 1.2vw, 12px); max-width: 92%; display: flex; flex-direction: column; gap: 4px; align-items: center; width: 100%; }');
  html = html.replace('.core-focus .fc-item { background: rgba(212,175,106,0.08);', '.core-focus .fc-item { background: rgba(212,175,106,0.10); border: 1px solid rgba(212,175,106,0.25); border-radius: 20px; padding: 3px 12px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }');
}

// ============ 2. 同步脚本：聚焦精简渲染（只显示前 2 条 + "更多"提示） ============
// 找 syncFocus 函数并替换为精简版
const oldSyncFocus = `  function syncFocus() {
    const f2 = document.getElementById('deck-focus2');
    const f1 = document.getElementById('deck-focus');
    if (f2 && f1 && f1.innerHTML) f2.innerHTML = f1.innerHTML;
  }
  setInterval(syncFocus, 1500);`;
const newSyncFocus = `  function syncFocus() {
    const f2 = document.getElementById('deck-focus2');
    const f1 = document.getElementById('deck-focus');
    if (!f2 || !f1) return;
    const items = f1.querySelectorAll('.deck-focus-item');
    if (!items.length) { f2.innerHTML = ''; return; }
    let out = '';
    const showN = Math.min(2, items.length);
    for (let i = 0; i < showN; i++) {
      const txt = items[i].querySelector('.txt');
      const t = txt ? txt.textContent.trim() : '';
      const done = items[i].classList.contains('done');
      out += '<div class="fc-item' + (done ? ' done' : '') + '" title="点击查看全部">' + t.slice(0, 14) + '</div>';
    }
    if (items.length > showN) out += '<div class="fc-more">+' + (items.length - showN) + ' 更多 · 点击核心查看</div>';
    f2.innerHTML = out;
  }
  setInterval(syncFocus, 1500);`;
if (html.includes(oldSyncFocus)) {
  html = html.replace(oldSyncFocus, newSyncFocus);
  console.log('✅ 聚焦同步改为精简版（最多 2 条 + 更多提示）');
} else {
  console.log('⚠️ syncFocus 未匹配');
}

// ============ 3. 点击核心打开学业抽屉（d1 里有完整聚焦） ============
// 核心 onclick 已经是 openDrawer('d1')，保持；但 fc-item 点击也触发打开
html = html.replace('<div class="core-focus" id="deck-focus2"></div>', '<div class="core-focus" id="deck-focus2" onclick="openDrawer(\'d1\', document.querySelector(\'.sat[data-drawer="d1"]\'))"></div>');
console.log('✅ 聚焦区域点击打开学业抽屉');

// ============ 4. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ v5 完成！大小:', (html.length / 1024).toFixed(1), 'KB');
