// 星系核心科技感增强 v9：核心加同心圆环 + 发光环；卫星图标金色化
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 核心增强：加内圈环 + 外圈环（概念图机械感） ============
// 在 .galaxy-core 前插入环形装饰
const oldCoreHtml = `<div class="galaxy-core" onclick="openDrawer('d1', document.querySelector('.sat[data-drawer="d1"]'))">`;
const newCoreHtml = `<div class="core-ring ring-outer"></div>
  <div class="core-ring ring-inner"></div>
  <div class="galaxy-core" onclick="openDrawer('d1', document.querySelector('.sat[data-drawer="d1"]'))">`;
html = html.replace(oldCoreHtml, newCoreHtml);
console.log('✅ 核心环形装饰已插入');

// 环形样式
const ringCSS = `
  .core-ring {
    position: absolute; border-radius: 50%; pointer-events: none; z-index: 4;
  }
  .ring-outer {
    width: min(340px, 62vw); height: min(340px, 62vw);
    border: 1px solid rgba(212,175,106,0.22);
    box-shadow: 0 0 30px rgba(212,175,106,0.08), inset 0 0 40px rgba(212,175,106,0.04);
    animation: ringSpin 60s linear infinite;
  }
  .ring-inner {
    width: min(308px, 56vw); height: min(308px, 56vw);
    border: 1px dashed rgba(212,175,106,0.28);
    animation: ringSpin 40s linear infinite reverse;
  }
  @keyframes ringSpin { to { transform: rotate(360deg); } }
  .ring-outer::after, .ring-inner::after {
    content:''; position: absolute; top: -3px; left: 50%;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent); box-shadow: 0 0 12px rgba(212,175,106,0.9);
  }
  .ring-inner::after { background: #e8c98f; box-shadow: 0 0 10px rgba(232,201,143,0.8); }
`;
html = html.replace('  /* 轨道 */\n  .orbit {', ringCSS + '\n  /* 轨道 */\n  .orbit {');
console.log('✅ 环形旋转动画已加');

// ============ 2. 卫星图标：彩色 emoji → 金色单色（filter 灰度+金色） ============
// 给 .s-ic 加金色滤镜，让 emoji 变成金色单色系
const oldSic = `.sat .s-ic { font-size: clamp(20px, 2.8vw, 26px); }`;
const newSic = `.sat .s-ic {
    font-size: clamp(20px, 2.8vw, 26px);
    filter: grayscale(1) sepia(1) saturate(2.2) hue-rotate(-5deg) brightness(1.05);
    display: inline-block;
  }`;
html = html.replace(oldSic, newSic);
console.log('✅ 卫星图标已金色化（CSS 滤镜）');

// ============ 3. 卫星更科技感：加顶部金色光条 ============
const oldSat = `.sat {
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
  }`;
const newSat = `.sat {
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
    position: relative;
    overflow: hidden;
  }
  .sat::before {
    content:''; position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,106,0.55), transparent);
    opacity: .7;
  }`;
if (html.includes(oldSat)) {
  html = html.replace(oldSat, newSat);
  console.log('✅ 卫星加顶部金色光条');
} else {
  console.log('⚠️ .sat 样式未匹配（可能被 v5 改过）');
}

// ============ 4. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ v9 科技感增强完成！大小:', (html.length / 1024).toFixed(1), 'KB');
