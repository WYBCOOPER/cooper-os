// 仪表盘式星系布局 v10：中央大圆（核心）+ 左右小圆（功能面板）+ 金色连接线
// 参考概念图：黑底 + 金色发光圆形结构 + 细线网络
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 重写星系 CSS：仪表盘式 ============
// 找到现有星系 CSS 区（从 /* ===== 星系总控台 到 手机端适配结束）
const gStart = html.indexOf('/* ===== 星系总控台（黑金版）=====');
const gEnd = html.indexOf('  /* 桌面端：星系上方 + 内容下方 */');
if (gStart < 0 || gEnd < 0) { console.log('❌ 星系 CSS 区未找到'); process.exit(1); }

const newGalaxyCSS = `/* ===== 星系总控台（黑金版） ===== */
  /* 仪表盘式：中央大圆 + 左右小圆 */
  .galaxy {
    position: relative;
    width: min(880px, 96vw);
    margin: 8px auto 30px;
    aspect-ratio: 1 / 0.72;
    display: flex; align-items: center; justify-content: center;
  }
  /* 中央大圆（核心） */
  .galaxy-core {
    position: relative; z-index: 5;
    width: min(320px, 46vw);
    height: min(320px, 46vw);
    background: radial-gradient(circle at 35% 30%, rgba(212,175,106,0.20), rgba(12,13,16,0.95) 72%);
    border: 2px solid rgba(212,175,106,0.55);
    border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-shadow: 0 0 80px rgba(212,175,106,0.28), inset 0 0 50px rgba(212,175,106,0.08);
    animation: corePulse 5s ease-in-out infinite;
    cursor: pointer;
    text-align: center; padding: 16px;
    transition: transform .3s var(--ease);
    overflow: hidden;
  }
  .galaxy-core:hover { transform: scale(1.02); }
  @keyframes corePulse {
    0%, 100% { box-shadow: 0 0 60px rgba(212,175,106,0.22), inset 0 0 44px rgba(212,175,106,0.06); }
    50% { box-shadow: 0 0 110px rgba(212,175,106,0.40), inset 0 0 70px rgba(212,175,106,0.13); }
  }
  /* 核心装饰环（同心圆） */
  .core-ring {
    position: absolute; border-radius: 50%; pointer-events: none; z-index: 4;
  }
  .ring-outer {
    width: min(390px, 56vw); height: min(390px, 56vw);
    border: 1px solid rgba(212,175,106,0.25);
    box-shadow: 0 0 40px rgba(212,175,106,0.08), inset 0 0 50px rgba(212,175,106,0.05);
    animation: ringSpin 80s linear infinite;
  }
  .ring-inner {
    width: min(355px, 51vw); height: min(355px, 51vw);
    border: 1px dashed rgba(212,175,106,0.32);
    animation: ringSpin 55s linear infinite reverse;
  }
  @keyframes ringSpin { to { transform: rotate(360deg); } }
  .ring-outer::after, .ring-inner::after {
    content:''; position: absolute; top: -3px; left: 50%;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent); box-shadow: 0 0 14px rgba(212,175,106,1);
  }
  .ring-inner::after { background: #e8c98f; box-shadow: 0 0 12px rgba(232,201,143,0.9); }

  /* 核心内容 */
  .core-time { font-family: var(--mono); font-size: clamp(26px, 3.8vw, 40px); font-weight: 700; color: #e8c98f; letter-spacing: .04em; text-shadow: 0 0 30px rgba(212,175,106,0.6); line-height: 1.1; }
  .core-date { font-size: clamp(11px, 1.4vw, 13px); color: var(--text-dim); letter-spacing: .2em; margin-top: 6px; }
  .core-label { font-size: clamp(9px, 1.2vw, 11px); color: var(--accent); letter-spacing: .3em; margin-top: 10px; opacity: .9; }
  .core-focus { margin-top: 7px; font-size: clamp(10px, 1.2vw, 12px); color: var(--text); max-width: 90%; display: flex; flex-direction: column; gap: 4px; align-items: center; width: 100%; }
  .core-focus .fc-item { background: rgba(212,175,106,0.10); border: 1px solid rgba(212,175,106,0.28); border-radius: 20px; padding: 3px 12px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; transition: all .2s var(--ease); }
  .core-focus .fc-item:hover { background: rgba(212,175,106,0.22); transform: scale(1.03); }
  .core-focus .fc-item.done { opacity: .45; text-decoration: line-through; }
  .core-focus .fc-more { color: var(--text-faint); font-size: clamp(8px, 1vw, 10px); letter-spacing: .1em; }
  .core-weather { font-family: var(--mono); font-size: clamp(8px, 1.1vw, 10px); color: var(--text-faint); letter-spacing: .12em; margin-top: 6px; max-width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .core-add {
    margin-top: 7px; padding: 4px 13px; font-size: clamp(9px, 1.1vw, 10px);
    color: var(--accent); border: 1px solid rgba(212,175,106,0.35); border-radius: 20px;
    cursor: pointer; background: rgba(212,175,106,0.06);
    transition: all .25s var(--ease); white-space: nowrap;
  }
  .core-add:hover { background: rgba(212,175,106,0.18); border-color: var(--accent); transform: translateY(-1px); }
  .core-ddl { margin-top: 7px; font-size: clamp(8px, 1vw, 10px); color: #ffb4a2; max-width: 92%; display: flex; flex-direction: column; gap: 3px; align-items: center; }
  .core-ddl .ddl-item { background: rgba(255,122,148,0.08); border: 1px solid rgba(255,122,148,0.22); border-radius: 6px; padding: 2px 8px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .core-ddl .ddl-empty { color: var(--text-faint); }

  /* 左右小圆（仪表盘副表盘） */
  .dial {
    position: absolute; z-index: 6;
    width: clamp(120px, 17vw, 170px);
    height: clamp(120px, 17vw, 170px);
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, rgba(212,175,106,0.14), rgba(12,13,16,0.95) 70%);
    border: 1.5px solid rgba(212,175,106,0.42);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
    color: var(--text); font-size: clamp(10px, 1.3vw, 12px);
    box-shadow: 0 0 40px rgba(212,175,106,0.12), inset 0 0 30px rgba(212,175,106,0.05);
    cursor: pointer;
    transition: transform .25s var(--ease), border-color .25s, box-shadow .25s;
    backdrop-filter: blur(12px);
    text-align: center;
    animation: dialPulse 7s ease-in-out infinite;
  }
  @keyframes dialPulse {
    0%, 100% { box-shadow: 0 0 30px rgba(212,175,106,0.10), inset 0 0 24px rgba(212,175,106,0.04); }
    50% { box-shadow: 0 0 55px rgba(212,175,106,0.22), inset 0 0 38px rgba(212,175,106,0.09); }
  }
  .dial:hover { transform: scale(1.05); border-color: rgba(212,175,106,0.7); }
  .dial.active { border-color: var(--accent); background: radial-gradient(circle at 35% 30%, rgba(40,32,14,0.9), rgba(14,12,8,0.95) 70%); }
  .dial .d-ic {
    font-size: clamp(22px, 3vw, 30px);
    filter: grayscale(1) sepia(1) saturate(2.2) hue-rotate(-5deg) brightness(1.05);
    display: inline-block;
  }
  .dial .d-num { font-family: var(--mono); font-size: clamp(14px, 1.8vw, 20px); font-weight: 700; color: #e8c98f; }
  .dial .d-label { font-size: clamp(9px, 1.2vw, 11px); color: var(--text-dim); letter-spacing: .15em; }

  /* 位置：左 2 个 + 右 2 个（小圆环绕大圆） */
  .dial-l1 { left: 0; top: 12%; }
  .dial-l2 { left: 4%; bottom: 8%; }
  .dial-r1 { right: 0; top: 12%; }
  .dial-r2 { right: 4%; bottom: 8%; }

  /* 金色连接线（SVG 网络） */
  .galaxy-links { position: absolute; inset: 0; z-index: 1; pointer-events: none; width: 100%; height: 100%; }

  /* 桌面端 */
  @media (min-width: 760px) {
    .galaxy { margin-bottom: 26px; }
  }
  /* 手机端 */
  @media (max-width: 760px) {
    .galaxy { aspect-ratio: 1 / 0.95; margin-bottom: 22px; }
    .galaxy-core { width: min(240px, 60vw); height: min(240px, 60vw); }
    .dial { width: clamp(92px, 24vw, 120px); height: clamp(92px, 24vw, 120px); }
    .core-focus { display: none; }
    .core-weather { display: none; }
    .core-ddl { display: none; }
  }
`;

html = html.slice(0, gStart) + newGalaxyCSS + html.slice(gEnd);
console.log('✅ 仪表盘式 CSS 已重写');

// ============ 2. 重写星系 HTML：中央大圆 + 左右 4 小圆 + SVG 连接线 ============
// 找到当前星系 HTML 块
const ghStart = html.indexOf('<!-- ===== 星系总控台（黑金）=====');
const ghEnd = html.indexOf('<!-- 隐藏原始指挥台');
if (ghStart < 0 || ghEnd < 0) { console.log('❌ 星系 HTML 块未找到'); process.exit(1); }

const newGalaxyHTML = `<!-- ===== 星系总控台（仪表盘式，黑金）===== -->
<div class="galaxy">
  <svg class="galaxy-links" viewBox="0 0 880 640" preserveAspectRatio="none">
    <line x1="440" y1="320" x2="100" y2="140" stroke="rgba(212,175,106,0.25)" stroke-width="1"/>
    <line x1="440" y1="320" x2="140" y2="480" stroke="rgba(212,175,106,0.25)" stroke-width="1"/>
    <line x1="440" y1="320" x2="780" y2="140" stroke="rgba(212,175,106,0.25)" stroke-width="1"/>
    <line x1="440" y1="320" x2="740" y2="480" stroke="rgba(212,175,106,0.25)" stroke-width="1"/>
    <circle cx="440" cy="320" r="210" fill="none" stroke="rgba(212,175,106,0.12)" stroke-width="1"/>
    <circle cx="440" cy="320" r="250" fill="none" stroke="rgba(212,175,106,0.08)" stroke-width="1" stroke-dasharray="4 8"/>
  </svg>
  <div class="core-ring ring-outer"></div>
  <div class="core-ring ring-inner"></div>
  <!-- 左右仪表盘小圆 -->
  <div class="dial dial-l1" data-drawer="d1" onclick="openDrawer('d1', this)">
    <span class="d-ic">📚</span>
    <div class="d-num" id="dial-num-1">0</div>
    <div class="d-label">学业</div>
  </div>
  <div class="dial dial-l2" data-drawer="d3" onclick="openDrawer('d3', this)">
    <span class="d-ic">🏠</span>
    <div class="d-num" id="dial-num-2">0</div>
    <div class="d-label">生活</div>
  </div>
  <div class="dial dial-r1" data-drawer="d2" onclick="openDrawer('d2', this)">
    <span class="d-ic">💼</span>
    <div class="d-num" id="dial-num-3">0</div>
    <div class="d-label">工作</div>
  </div>
  <div class="dial dial-r2" data-drawer="d7" onclick="openDrawer('d7', this)">
    <span class="d-ic">🤖</span>
    <div class="d-num" id="dial-num-4">0</div>
    <div class="d-label">对话</div>
  </div>
  <!-- 中央核心 -->
  <div class="galaxy-core" onclick="openDrawer('d1', document.querySelector('.dial[data-drawer="d1"]'))">
    <div class="core-time" id="deck-time2">--:--:--</div>
    <div class="core-date" id="deck-date2">----.--.--</div>
    <div class="core-label">C O O P E R // O S</div>
    <div class="core-focus" id="deck-focus2" onclick="openDrawer('d1', document.querySelector('.dial[data-drawer="d1"]'))"></div>
    <div class="core-weather" id="weather-widget2">…</div>
    <div class="core-add" onclick="addFocus()">＋ 今日聚焦</div>
    <div class="core-ddl" id="core-ddl"></div>
  </div>
</div>

`;

html = html.slice(0, ghStart) + newGalaxyHTML + html.slice(ghEnd);
console.log('✅ 仪表盘式 HTML 已重写');

// ============ 3. 清理旧卫星引用（satsHtml 已不存在，但检查残留） ============
const satLeft = html.match(/class="sat sat-\d/g);
if (satLeft) { console.log('⚠️ 残留卫星:', satLeft.length); } else { console.log('✅ 无旧卫星残留'); }

// ============ 4. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ v10 仪表盘式完成！大小:', (html.length / 1024).toFixed(1), 'KB');
