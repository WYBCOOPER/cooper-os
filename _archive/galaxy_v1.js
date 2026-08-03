// COOPER OS 星系总控台改造 v1（黑金版）
// 策略：保留全部功能（抽屉内容/JS/store），只换外壳布局
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 卫星轨道 CSS（黑金） ============
const galaxyCSS = `
  /* ===== 星系总控台（黑金版）===== */
  .galaxy {
    position: relative;
    width: min(880px, 94vw);
    margin: 10px auto 40px;
    aspect-ratio: 1 / 0.82;
    display: flex; align-items: center; justify-content: center;
  }
  /* 中心核心 */
  .galaxy-core {
    position: relative; z-index: 5;
    width: min(300px, 60vw);
    background: radial-gradient(circle at 35% 30%, rgba(212,175,106,0.16), rgba(10,12,18,0.92) 70%);
    border: 1px solid rgba(212,175,106,0.35);
    border-radius: 50%;
    aspect-ratio: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-shadow: 0 0 60px rgba(212,175,106,0.18), inset 0 0 40px rgba(212,175,106,0.06);
    animation: corePulse 6s ease-in-out infinite;
    cursor: pointer;
    text-align: center;
    padding: 20px;
  }
  @keyframes corePulse {
    0%, 100% { box-shadow: 0 0 50px rgba(212,175,106,0.15), inset 0 0 40px rgba(212,175,106,0.05); }
    50% { box-shadow: 0 0 80px rgba(212,175,106,0.28), inset 0 0 60px rgba(212,175,106,0.10); }
  }
  .core-time { font-family: var(--mono); font-size: clamp(28px, 4.6vw, 46px); font-weight: 700; color: #e8c98f; letter-spacing: .04em; text-shadow: 0 0 24px rgba(212,175,106,0.5); line-height: 1.1; }
  .core-date { font-size: clamp(11px, 1.6vw, 14px); color: var(--text-dim); letter-spacing: .22em; margin-top: 8px; }
  .core-label { font-size: clamp(10px, 1.4vw, 12px); color: var(--accent); letter-spacing: .3em; margin-top: 12px; opacity: .85; }
  .core-focus { margin-top: 10px; font-size: clamp(11px, 1.5vw, 13px); color: var(--text); max-width: 85%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .core-focus .fc-item { background: rgba(212,175,106,0.08); border: 1px solid rgba(212,175,106,0.2); border-radius: 8px; padding: 3px 10px; margin: 3px auto; width: fit-content; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* 轨道 */
  .orbit { position: absolute; border: 1px solid rgba(212,175,106,0.14); border-radius: 50%; pointer-events: none; }
  .orbit-1 { inset: 8% 4% 20% 4%; animation: orbitSpin 90s linear infinite; }
  .orbit-2 { inset: 16% 14% 28% 14%; animation: orbitSpin 130s linear infinite reverse; }
  .orbit-3 { inset: 26% 26% 36% 26%; animation: orbitSpin 170s linear infinite; }
  @keyframes orbitSpin { to { transform: rotate(360deg); } }

  /* 卫星 */
  .sat {
    position: absolute; pointer-events: auto;
    width: clamp(88px, 13vw, 116px); height: clamp(72px, 10vw, 92px);
    background: linear-gradient(160deg, rgba(18,21,31,0.95), rgba(10,12,18,0.92));
    border: 1px solid rgba(212,175,106,0.28);
    border-radius: 16px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
    color: var(--text); font-size: clamp(11px, 1.5vw, 13px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.45), 0 0 18px rgba(212,175,106,0.07);
    cursor: pointer; z-index: 6;
    transition: transform .25s var(--ease), border-color .25s, box-shadow .25s;
    backdrop-filter: blur(14px);
    text-align: center;
  }
  .sat .s-ic { font-size: clamp(20px, 3vw, 26px); }
  .sat:hover { transform: translateY(-3px) scale(1.04); border-color: rgba(212,175,106,0.55); box-shadow: 0 12px 34px rgba(0,0,0,0.5), 0 0 26px rgba(212,175,106,0.18); }
  .sat.active { border-color: var(--accent); background: linear-gradient(160deg, rgba(30,25,14,0.97), rgba(14,12,8,0.94)); box-shadow: 0 0 30px rgba(212,175,106,0.28); }

  /* 卫星定位（轨道上的角度分布） */
  .sat-1 { top: -2%; left: 36%; }
  .sat-2 { top: 2%; right: 6%; }
  .sat-3 { bottom: 22%; right: 0%; }
  .sat-4 { bottom: 26%; left: 0%; }
  .sat-5 { top: 16%; left: 2%; }
  .sat-6 { top: 30%; right: 20%; }
  .sat-7 { bottom: 8%; left: 18%; }

  /* 桌面端：主区与星系并列 */
  @media (min-width: 1100px) {
    .galaxy-wrap { display: grid; grid-template-columns: 1.15fr 1fr; gap: 24px; align-items: start; }
    .galaxy { width: 100%; margin: 0; }
    .shell { margin-top: 8px; }
  }

  /* 手机端：星系在上，抽屉在下 */
  @media (max-width: 760px) {
    .galaxy { aspect-ratio: 1 / 0.9; }
    .sat { width: 82px; height: 66px; font-size: 10.5px; border-radius: 13px; }
    .sat .s-ic { font-size: 19px; }
    .orbit-1 { inset: 6% 2% 24% 2%; }
    .orbit-3 { inset: 24% 22% 40% 22%; }
    .core-focus { display: none; }
  }
`;

// ============ 2. 在 </style> 前插入星系 CSS ============
const styleEnd = html.lastIndexOf('</style>');
if (styleEnd < 0) { console.log('❌ 找不到 </style>'); process.exit(1); }
html = html.slice(0, styleEnd) + galaxyCSS + '\n' + html.slice(styleEnd);
console.log('✅ 星系 CSS 已插入');

// ============ 3. 改造 body 结构：把 command-deck 包进星系，drawer-nav 变卫星 ============
// 找到 command-deck 和 drawer-nav 的位置
const deckStart = html.indexOf('<div class="command-deck">');
const navStart = html.indexOf('<div class="drawer-nav">');
const navEnd = html.indexOf('</div>', navStart) + 7; // drawer-nav 的闭合（注意可能有多层）

if (deckStart < 0 || navStart < 0) { console.log('❌ 找不到 command-deck 或 drawer-nav'); process.exit(1); }

// 提取 command-deck 内部内容（deck-time/date/weather/focus 等）
const deckEnd = html.indexOf('</div>', deckStart) + 7; // command-deck 闭合

// 提取卫星按钮
const navContent = html.slice(navStart, navEnd);
// 生成卫星按钮（从 navContent 提取 data-drawer 和文字）
const satMap = {
  'd1': ['📚', '学业'], 'd2': ['💼', '工作'], 'd3': ['🏠', '生活'],
  'd4': ['🧠', '知识库'], 'd5': ['🌐', '工具'], 'd6': ['📓', '日记'], 'd7': ['🤖', '对话']
};
let satsHtml = '';
let idx2 = 1;
for (const [id, [ic, label]] of Object.entries(satMap)) {
  satsHtml += `<div class="sat sat-${idx2}" onclick="openDrawer('${id}', this)" title="${label}"><span class="s-ic">${ic}</span><span>${label}</span></div>\n`;
  idx2++;
}

// 构造新的星系外壳（替换 command-deck + drawer-nav 区域）
const galaxyShell = `
<!-- ===== 星系总控台 ===== -->
<div class="galaxy-wrap">
  <div class="galaxy">
    <div class="orbit orbit-1"></div>
    <div class="orbit orbit-2"></div>
    <div class="orbit orbit-3"></div>
    ${satsHtml}
    <div class="galaxy-core" onclick="openDrawer('d1', document.querySelector('.sat-1'))">
      <div class="core-time" id="deck-time2">--:--:--</div>
      <div class="core-date" id="deck-date2">----.--.--</div>
      <div class="core-label">C O O P E R // O S</div>
      <div class="core-focus" id="deck-focus2"></div>
      <div id="weather-widget2" style="font-family:var(--mono);font-size:10px;color:var(--text-faint);letter-spacing:.14em;margin-top:8px">…</div>
    </div>
  </div>
  <div class="shell-area">
`;

// 替换：从 command-deck 开始到 drawer-nav 结束 → 新的星系外壳 + 隐藏原 command-deck 但保留原抽屉 nav 结构？
// 策略：command-deck 整个替换成 galaxy，drawer-nav 保留（因为 openDrawer 需要按钮？不需要，按钮只是触发）
// 但抽屉内容在 .shell 里，保留 .shell。原来的 drawer-nav 可以删除（卫星替代）。
// 注意：openDrawer(id, btn) 需要 btn 参数做 active 样式，卫星传 this 即可。

const deckToNav = html.slice(deckStart, navEnd);
html = html.replace(deckToNav, galaxyShell);
console.log('✅ command-deck + drawer-nav → 星系外壳');

// ============ 4. 时钟/日期/天气/聚焦同步到核心 ============
// 找到原 deck-time 更新逻辑，加上同步到 deck-time2
// 简单方案：在 </body> 前注入同步脚本（每 1s 从原元素复制，或直接独立时钟）
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
  // 聚焦同步
  function syncFocus() {
    const f2 = document.getElementById('deck-focus2');
    const f1 = document.getElementById('deck-focus');
    if (f2 && f1) f2.innerHTML = f1.innerHTML;
  }
  setInterval(syncFocus, 1500);
  // 天气同步
  function syncWeather() {
    const w2 = document.getElementById('weather-widget2');
    const w1 = document.getElementById('weather-widget');
    if (w2 && w1 && w1.textContent !== 'LOADING WEATHER…') {
      w2.textContent = w1.textContent.replace(/\\s+/g, ' ').trim().slice(0, 40);
    }
  }
  setInterval(syncWeather, 3000);
})();
</script>
`;
html = html.replace('</body>', syncScript + '\n</body>');
console.log('✅ 核心同步脚本已注入');

fs.writeFileSync(path, html);
console.log('\n✅ 星系总控台改造完成！');
