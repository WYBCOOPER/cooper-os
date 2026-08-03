// 星系核心修复 v4：① 固定核心为真圆 ② 加"添加聚焦"按钮 ③ 核心显示 DDL
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 核心形状：固定宽高为正方形，防止内容撑成椭圆 ============
const oldCoreCSS = `.galaxy-core {
    position: relative; z-index: 5;
    width: min(300px, 58vw);
    background: radial-gradient(circle at 35% 30%, rgba(212,175,106,0.16), rgba(10,12,18,0.94) 70%);
    border: 1px solid rgba(212,175,106,0.38);
    border-radius: 50%;
    aspect-ratio: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-shadow: 0 0 60px rgba(212,175,106,0.18), inset 0 0 44px rgba(212,175,106,0.06);
    animation: corePulse 6s ease-in-out infinite;
    cursor: pointer;
    text-align: center; padding: 18px;
    transition: transform .3s var(--ease);
  }`;
const newCoreCSS = `.galaxy-core {
    position: relative; z-index: 5;
    width: min(280px, 52vw);
    height: min(280px, 52vw);
    background: radial-gradient(circle at 35% 30%, rgba(212,175,106,0.16), rgba(10,12,18,0.94) 70%);
    border: 1px solid rgba(212,175,106,0.38);
    border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-shadow: 0 0 60px rgba(212,175,106,0.18), inset 0 0 44px rgba(212,175,106,0.06);
    animation: corePulse 6s ease-in-out infinite;
    cursor: pointer;
    text-align: center; padding: 14px;
    transition: transform .3s var(--ease);
    overflow: hidden;
  }`;
if (html.includes(oldCoreCSS)) {
  html = html.replace(oldCoreCSS, newCoreCSS);
  console.log('✅ 核心已固定为真圆（宽高一致）');
} else {
  console.log('⚠️ 核心 CSS 未精确匹配，尝试局部替换');
  // 兜底：加 height 覆盖
  html = html.replace('.galaxy-core {\n    position: relative; z-index: 5;\n    width: min(300px, 58vw);', '.galaxy-core {\n    position: relative; z-index: 5;\n    width: min(280px, 52vw);\n    height: min(280px, 52vw);');
  html = html.replace('aspect-ratio: 1;\n    display: flex', 'display: flex');
  console.log('✅ 兜底替换完成');
}

// ============ 2. 核心内元素缩放（内容多，缩小字号） ============
const oldCoreTime = `.core-time { font-family: var(--mono); font-size: clamp(26px, 4.5vw, 44px);`;
const newCoreTime = `.core-time { font-family: var(--mono); font-size: clamp(22px, 3.6vw, 34px);`;
html = html.replace(oldCoreTime, newCoreTime);
html = html.replace('.core-focus { margin-top: 9px;', '.core-focus { margin-top: 6px;');
html = html.replace('.core-weather { font-family: var(--mono); font-size: clamp(9px, 1.2vw, 11px);', '.core-weather { font-family: var(--mono); font-size: clamp(8px, 1.1vw, 10px);');
console.log('✅ 核心内元素已适配圆形空间');

// ============ 3. 核心内添加"＋ 今日聚焦"按钮 ============
// 在 core-weather 后加一个添加按钮（调用全局 addFocus）
const addBtn = `
    <div class="core-add" onclick="addFocus()">＋ 今日聚焦</div>`;
html = html.replace('<div class="core-weather" id="weather-widget2">…</div>', '<div class="core-weather" id="weather-widget2">…</div>' + addBtn);

// 加按钮样式（在核心 CSS 后）
const addBtnCSS = `
  .core-add {
    margin-top: 8px; padding: 5px 14px; font-size: clamp(9px, 1.2vw, 11px);
    color: var(--accent); border: 1px solid rgba(212,175,106,0.3); border-radius: 20px;
    cursor: pointer; background: rgba(212,175,106,0.06);
    transition: all .25s var(--ease); white-space: nowrap;
  }
  .core-add:hover { background: rgba(212,175,106,0.16); border-color: var(--accent); transform: translateY(-1px); }
`;
html = html.replace('  .core-weather { font-family: var(--mono);', addBtnCSS + '\n  .core-weather { font-family: var(--mono);');
console.log('✅ 核心添加聚焦按钮已插入');

// ============ 4. 核心显示 DDL（同步 deck-ddl 内容） ============
// 在核心内加 DDL 容器
html = html.replace('<div class="core-add" onclick="addFocus()">＋ 今日聚焦</div>', '<div class="core-add" onclick="addFocus()">＋ 今日聚焦</div>\n    <div class="core-ddl" id="core-ddl"></div>');

const ddlCSS = `
  .core-ddl { margin-top: 8px; font-size: clamp(8px, 1.1vw, 10px); color: #ffb4a2; max-width: 92%; display: flex; flex-direction: column; gap: 3px; align-items: center; }
  .core-ddl .ddl-item { background: rgba(255,122,148,0.08); border: 1px solid rgba(255,122,148,0.2); border-radius: 6px; padding: 2px 8px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .core-ddl .ddl-empty { color: var(--text-faint); }
`;
html = html.replace('  .core-add {', ddlCSS + '\n  .core-add {');
console.log('✅ 核心 DDL 容器已插入');

// ============ 5. 同步脚本：增加 DDL 同步 ============
const oldSync = `  function syncWeather() {
    const w2 = document.getElementById('weather-widget2');
    const w1 = document.getElementById('weather-widget');
    if (w2 && w1 && w1.textContent && w1.textContent.indexOf('LOADING') < 0) {
      const t = w1.textContent.replace(/\\s+/g, ' ').trim();
      if (t && t.length > 3) w2.textContent = t.slice(0, 44);
    }
  }
  setInterval(syncWeather, 3000);`;
const newSync = `  function syncWeather() {
    const w2 = document.getElementById('weather-widget2');
    const w1 = document.getElementById('weather-widget');
    if (w2 && w1 && w1.textContent && w1.textContent.indexOf('LOADING') < 0) {
      const t = w1.textContent.replace(/\\s+/g, ' ').trim();
      if (t && t.length > 3) w2.textContent = t.slice(0, 44);
    }
  }
  setInterval(syncWeather, 3000);
  function syncDDL() {
    const cd = document.getElementById('core-ddl');
    const d1 = document.getElementById('deck-ddl');
    if (cd && d1 && d1.innerHTML) cd.innerHTML = d1.innerHTML;
  }
  setInterval(syncDDL, 2000);`;
if (html.includes(oldSync)) {
  html = html.replace(oldSync, newSync);
  console.log('✅ DDL 同步已加入');
} else {
  console.log('⚠️ 同步脚本未精确匹配（可能换行差异）');
}

// ============ 6. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ v4 修复完成！大小:', (html.length / 1024).toFixed(1), 'KB');
