// COOPER OS 星系总控台改造 v2（黑金版）—— 最小侵入
// 策略：① 替换 command-deck 为星系（核心+轨道+卫星）② 隐藏原 drawer-nav（卫星替代）③ 保留全部抽屉/JS/数据
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 星系 CSS ============
const galaxyCSS = `
  /* ===== 星系总控台（黑金版）===== */
  .galaxy {
    position: relative;
    width: min(860px, 96vw);
    margin: 6px auto 34px;
    aspect-ratio: 1 / 0.86;
    display: flex; align-items: center; justify-content: center;
  }
  .galaxy-core {
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
  }
  .galaxy-core:hover { transform: scale(1.03); }
  @keyframes corePulse {
    0%, 100% { box-shadow: 0 0 50px rgba(212,175,106,0.15), inset 0 0 40px rgba(212,175,106,0.05); }
    50% { box-shadow: 0 0 85px rgba(212,175,106,0.30), inset 0 0 60px rgba(212,175,106,0.11); }
  }
  .core-time { font-family: var(--mono); font-size: clamp(26px, 4.5vw, 44px); font-weight: 700; color: #e8c98f; letter-spacing: .04em; text-shadow: 0 0 26px rgba(212,175,106,0.55); line-height: 1.1; }
  .core-date { font-size: clamp(11px, 1.5vw, 14px); color: var(--text-dim); letter-spacing: .2em; margin-top: 8px; }
  .core-label { font-size: clamp(9px, 1.3vw, 12px); color: var(--accent); letter-spacing: .32em; margin-top: 12px; opacity: .9; }
  .core-focus { margin-top: 9px; font-size: clamp(11px, 1.4vw, 13px); color: var(--text); max-width: 88%; }
  .core-focus .fc-item { background: rgba(212,175,106,0.08); border: 1px solid rgba(212,175,106,0.22); border-radius: 8px; padding: 3px 10px; margin: 3px auto; width: fit-content; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .core-weather { font-family: var(--mono); font-size: clamp(9px, 1.2vw, 11px); color: var(--text-faint); letter-spacing: .12em; margin-top: 8px; max-width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .orbit { position: absolute; border: 1px solid rgba(212,175,106,0.13); border-radius: 50%; pointer-events: none; }
  .orbit-1 { inset: 7% 3% 22% 3%; animation: orbitSpin 90s linear infinite; }
  .orbit-2 { inset: 15% 13% 30% 13%; animation: orbitSpin 130s linear infinite reverse; }
  .orbit-3 { inset: 25% 25% 38% 25%; animation: orbitSpin 170s linear infinite; }
  @keyframes orbitSpin { to { transform: rotate(360deg); } }

  .sat {
    position: absolute; pointer-events: auto;
    width: clamp(88px, 13vw, 114px); height: clamp(72px, 10vw, 90px);
    background: linear-gradient(160deg, rgba(19,22,32,0.95), rgba(10,12,18,0.93));
    border: 1px solid rgba(212,175,106,0.30);
    border-radius: 16px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
    color: var(--text); font-size: clamp(11px, 1.4vw, 13px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.45), 0 0 16px rgba(212,175,106,0.06);
    cursor: pointer; z-index: 6;
    transition: transform .25s var(--ease), border-color .25s, box-shadow .25s;
    backdrop-filter: blur(14px);
    text-align: center;
  }
  .sat .s-ic { font-size: clamp(20px, 2.8vw, 26px); }
  .sat:hover { transform: translateY(-3px) scale(1.05); border-color: rgba(212,175,106,0.6); box-shadow: 0 12px 34px rgba(0,0,0,0.5), 0 0 28px rgba(212,175,106,0.2); }
  .sat.active { border-color: var(--accent); background: linear-gradient(160deg, rgba(32,26,14,0.98), rgba(14,12,8,0.95)); box-shadow: 0 0 34px rgba(212,175,106,0.3); }

  .sat-1 { top: -1%; left: 36%; }
  .sat-2 { top: 3%; right: 5%; }
  .sat-3 { bottom: 21%; right: -1%; }
  .sat-4 { bottom: 25%; left: -1%; }
  .sat-5 { top: 17%; left: 1%; }
  .sat-6 { top: 32%; right: 19%; }
  .sat-7 { bottom: 7%; left: 17%; }

  /* 桌面端：星系上方 + 内容下方 */
  @media (min-width: 760px) {
    .galaxy { margin-bottom: 30px; }
  }
  /* 手机端适配 */
  @media (max-width: 760px) {
    .galaxy { aspect-ratio: 1 / 0.92; margin-bottom: 24px; }
    .sat { width: 80px; height: 64px; font-size: 10px; border-radius: 13px; }
    .sat .s-ic { font-size: 18px; }
    .orbit-1 { inset: 5% 1% 26% 1%; }
    .orbit-3 { inset: 24% 21% 42% 21%; }
    .core-focus { display: none; }
  }
`;

// ============ 2. 插入星系 CSS ============
const styleEnd = html.lastIndexOf('</style>');
if (styleEnd < 0) { console.log('❌ 找不到 </style>'); process.exit(1); }
html = html.slice(0, styleEnd) + galaxyCSS + '\n' + html.slice(styleEnd);
console.log('✅ 星系 CSS 已插入');

// ============ 3. 替换 command-deck（配平找闭合） ============
const deckStart = html.indexOf('<div class="command-deck">');
if (deckStart < 0) { console.log('❌ 找不到 command-deck'); process.exit(1); }
let depth = 0, i = deckStart, deckEnd = -1;
while (i < html.length) {
  if (html.startsWith('<div', i)) depth++;
  if (html.startsWith('</div>', i)) {
    depth--;
    if (depth === 0) { deckEnd = i + 6; break; }
  }
  i++;
}
if (deckEnd < 0) { console.log('❌ command-deck 配平失败'); process.exit(1); }
console.log('command-deck 范围:', deckStart, '→', deckEnd);

// 生成卫星
const satMap = [
  ['d1', '📚', '学业'], ['d2', '💼', '工作'], ['d3', '🏠', '生活'],
  ['d7', '🤖', '对话'], ['d6', '📓', '日记'], ['d4', '🧠', '知识库'], ['d5', '🌐', '工具']
];
let satsHtml = '';
satMap.forEach(([id, ic, label], n) => {
  satsHtml += `<div class="sat sat-${n + 1}" data-drawer="${id}" onclick="openDrawer('${id}', this)" title="${label}"><span class="s-ic">${ic}</span><span>${label}</span></div>\n`;
});

const galaxyShell = `
<!-- ===== 星系总控台（黑金）===== -->
<div class="galaxy">
  <div class="orbit orbit-1"></div>
  <div class="orbit orbit-2"></div>
  <div class="orbit orbit-3"></div>
  ${satsHtml}
  <div class="galaxy-core" onclick="openDrawer('d1', document.querySelector('.sat[data-drawer="d1"]'))">
    <div class="core-time" id="deck-time2">--:--:--</div>
    <div class="core-date" id="deck-date2">----.--.--</div>
    <div class="core-label">C O O P E R // O S</div>
    <div class="core-focus" id="deck-focus2"></div>
    <div class="core-weather" id="weather-widget2">…</div>
  </div>
</div>
`;
html = html.slice(0, deckStart) + galaxyShell + html.slice(deckEnd);
console.log('✅ command-deck → 星系外壳');

// ============ 4. 隐藏原 drawer-nav（卫星替代导航） ============
// 找到 drawer-nav div（配平）
const navStart = html.indexOf('<div class="drawer-nav">');
if (navStart < 0) { console.log('⚠️ 找不到 drawer-nav（可能已被替换）'); } else {
  depth = 0; i = navStart; let navEnd = -1;
  while (i < html.length) {
    if (html.startsWith('<div', i)) depth++;
    if (html.startsWith('</div>', i)) {
      depth--;
      if (depth === 0) { navEnd = i + 6; break; }
    }
    i++;
  }
  if (navEnd > 0) {
    html = html.slice(0, navStart) + '<!-- 原抽屉导航已被卫星替代 -->' + html.slice(navEnd);
    console.log('✅ 原 drawer-nav 已移除（卫星替代）');
  }
}

// ============ 5. 核心同步脚本 ============
const syncScript = `
<script>
/* ===== 星系核心同步（黑金版） ===== */
(function () {
  function syncCore() {
    const t2 = document.getElementById('deck-time2');
    const d2 = document.getElementById('deck-date2');
    const t1 = document.getElementById('deck-time');
    const d1 = document.getElementById('deck-date');
    if (t2 && t1) t2.textContent = t1.textContent;
    if (d2 && d1) d2.textContent = d1.textContent;
  }
  setInterval(syncCore, 500);
  setTimeout(syncCore, 200);
  function syncFocus() {
    const f2 = document.getElementById('deck-focus2');
    const f1 = document.getElementById('deck-focus');
    if (f2 && f1 && f1.innerHTML) f2.innerHTML = f1.innerHTML;
  }
  setInterval(syncFocus, 1500);
  function syncWeather() {
    const w2 = document.getElementById('weather-widget2');
    const w1 = document.getElementById('weather-widget');
    if (w2 && w1 && w1.textContent && w1.textContent.indexOf('LOADING') < 0) {
      const t = w1.textContent.replace(/\\s+/g, ' ').trim();
      if (t && t.length > 3) w2.textContent = t.slice(0, 44);
    }
  }
  setInterval(syncWeather, 3000);
})();
</script>
`;
html = html.replace('</body>', syncScript + '\n</body>');
console.log('✅ 核心同步脚本已注入');

// ============ 6. 校验括号平衡 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号平衡:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号平衡:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ 星系总控台改造完成！大小:', (html.length / 1024).toFixed(1), 'KB');
