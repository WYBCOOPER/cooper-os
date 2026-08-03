// 修复：① 顶栏遮挡小球 ② 核心聚焦可完成/可删除
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 顶栏遮挡修复：星系顶部留出空间 ============
// 方案：galaxy 容器加 margin-top，且最上方小球（dial-4 工具）不再用负 top
const oldGalaxy = `.galaxy {
    position: relative;
    width: min(880px, 96vw);
    margin: 8px auto 30px;
    aspect-ratio: 1 / 0.72;
    display: flex; align-items: center; justify-content: center;
  }`;
const newGalaxy = `.galaxy {
    position: relative;
    width: min(880px, 96vw);
    margin: 56px auto 30px;
    aspect-ratio: 1 / 0.72;
    display: flex; align-items: center; justify-content: center;
  }`;
if (html.includes(oldGalaxy)) {
  html = html.replace(oldGalaxy, newGalaxy);
  console.log('✅ 星系顶部留出 56px（避开顶栏）');
}

// dial-4（工具，最上方）从 top:-14% 改为 top:2%（不再超出容器）
const oldD4 = `.dial-4 { top: -14%; left: 50%; transform: translateX(-50%); }  /* 工具：核心上方居中 */`;
const newD4 = `.dial-4 { top: -6%; left: 50%; transform: translateX(-50%); }  /* 工具：核心上方 */`;
if (html.includes(oldD4)) {
  html = html.replace(oldD4, newD4);
  console.log('✅ 工具小球下移到 -6%（不再被顶栏遮）');
}

// 手机端 dial-4 也调整
const oldM4 = `.dial-4 { top: -10%; left: 50%; transform: translateX(-50%); }`;
const newM4 = `.dial-4 { top: -5%; left: 50%; transform: translateX(-50%); }`;
if (html.includes(oldM4)) {
  html = html.replace(oldM4, newM4);
  console.log('✅ 手机端工具小球调整');
}

// ============ 2. 核心聚焦：可完成/可删除 ============
// 找到 syncFocus 精简版，改成带交互的版本：
// fc-item 点击 = 切换完成（toggleFocus），加一个小 ✕ 删除
const oldSyncFocus = `  function syncFocus() {
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
      out += '<div class="fc-item' + (done ? ' done' : '') + '" onclick="toggleFocus(' + i + ')" title="点击标记完成/未完成">' +
             '<span class="fc-txt">' + t.slice(0, 12) + '</span>' +
             '<span class="fc-x" onclick="event.stopPropagation();delFocus(' + i + ')" title="删除">✕</span>' +
             '</div>';
    }
    if (items.length > showN) out += '<div class="fc-more" onclick="openDrawer(\\'d1\\', document.querySelector(\\'.dial[data-drawer="d1"]\\'))">+' + (items.length - showN) + ' 更多</div>';
    f2.innerHTML = out;
    // 绑定样式
    const style = document.getElementById('fc-style');
    if (!style) {
      const s = document.createElement('style');
      s.id = 'fc-style';
      s.textContent = '.core-focus .fc-item{display:flex;align-items:center;gap:6px;cursor:pointer;}' +
        '.core-focus .fc-item .fc-x{font-size:9px;color:var(--text-faint);opacity:.7;}' +
        '.core-focus .fc-item .fc-x:hover{opacity:1;color:var(--red);}' +
        '.core-focus .fc-item.done .fc-txt{text-decoration:line-through;opacity:.5;}';
      document.head.appendChild(s);
    }
  }
  setInterval(syncFocus, 1500);`;

if (html.includes(oldSyncFocus)) {
  html = html.replace(oldSyncFocus, newSyncFocus);
  console.log('✅ 核心聚焦改为可点击完成 + ✕ 删除');
} else {
  console.log('⚠️ syncFocus 未精确匹配，尝试查找变体');
  const idx = html.indexOf('function syncFocus()');
  if (idx >= 0) {
    const end = html.indexOf('setInterval(syncFocus, 1500);', idx);
    console.log('找到 syncFocus @' + idx + ' → @' + end);
    // 提取当前内容对比
    console.log(html.slice(idx, idx + 800));
  }
}

// ============ 3. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ 修复完成！大小:', (html.length / 1024).toFixed(1), 'KB');
