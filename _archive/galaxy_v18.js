// 星系 v18：修复"核心正下方多出圆盘"——重新排布 7 板块为左右两列 + 上方
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 新布局：核心上方 1 个 + 左侧 3 个 + 右侧 3 个，正下方完全留空
// 左列：学业(上) 知识库(中) 生活(下)
// 右列：工作(上) 日记(中) 对话(下)
// 上方：工具

const oldPosStart = html.indexOf('  /* 位置：行星带式错落分布（非正圆，更自然） */');
const oldPosEnd = html.indexOf('  /* 金色连接线', oldPosStart);
if (oldPosStart < 0 || oldPosEnd < 0) { console.log('❌ 位置 CSS 未找到'); process.exit(1); }

const newPos = `  /* 位置：左右两列 + 上方，核心正下方留空（不挡模块区） */
  .dial-1 { top: 6%; left: 0; }        /* 学业：左列上 */
  .dial-2 { top: 6%; right: 0; }       /* 工作：右列上 */
  .dial-3 { bottom: 6%; right: 0; }    /* 对话：右列下 */
  .dial-4 { top: -14%; left: 50%; transform: translateX(-50%); }  /* 工具：核心上方居中 */
  .dial-5 { bottom: 6%; left: 0; }     /* 生活：左列下 */
  .dial-6 { top: 38%; left: -2%; }     /* 知识库：左列中 */
  .dial-7 { top: 38%; right: -2%; }    /* 日记：右列中 */

`;
html = html.slice(0, oldPosStart) + newPos + html.slice(oldPosEnd);
console.log('✅ 7 板块重排：左右两列 + 上方，下方留空');

// 修复 hover 冲突：dial-4 有 translateX(-50%)，其他没有
const oldHover = `.dial:hover { transform: scale(1.05); border-color: rgba(212,175,106,0.7); }`;
const newHover = `.dial:hover { transform: scale(1.05); border-color: rgba(212,175,106,0.7); }
  .dial-4:hover { transform: translateX(-50%) scale(1.05); }`;
if (html.includes(oldHover)) {
  html = html.replace(oldHover, newHover);
  console.log('✅ dial-4 hover 保留 translateX');
}

// active 也保留
const oldActive = '.dial.active { border-color: var(--accent); background: radial-gradient(circle at 35% 30%, rgba(40,32,14,0.9), rgba(14,12,8,0.95) 70%); }';
if (html.includes(oldActive)) {
  html = html.replace(oldActive, oldActive + '\n  .dial-4.active { transform: translateX(-50%); }');
  console.log('✅ dial-4 active 保留 translateX');
}

// 手机端：同样布局（左右两列 + 上方）
const oldMobilePos = `    .dial-1 { top: -6%; left: 4%; }
    .dial-2 { top: -8%; right: 4%; }
    .dial-3 { top: 24%; right: -4%; }
    .dial-4 { bottom: -6%; left: 8%; }
    .dial-5 { bottom: -8%; right: 8%; }
    .dial-6 { top: 24%; left: -4%; }
    .dial-7 { bottom: 18%; left: 24%; }`;
const newMobilePos = `    .dial-1 { top: 8%; left: 2%; }
    .dial-2 { top: 8%; right: 2%; }
    .dial-3 { bottom: 8%; right: 2%; }
    .dial-4 { top: -10%; left: 50%; transform: translateX(-50%); }
    .dial-5 { bottom: 8%; left: 2%; }
    .dial-6 { top: 40%; left: -2%; }
    .dial-7 { top: 40%; right: -2%; }`;
if (html.includes(oldMobilePos)) {
  html = html.replace(oldMobilePos, newMobilePos);
  console.log('✅ 手机端重排同步');
} else {
  console.log('⚠️ 手机端位置未匹配');
}

// SVG 连接线：更新为左右列 + 上方布局
const oldSvgStart = html.indexOf('<svg class="galaxy-links"');
const oldSvgEnd = html.indexOf('</svg>', oldSvgStart) + 6;
if (oldSvgStart >= 0 && oldSvgEnd > oldSvgStart) {
  const newSvg = `<svg class="galaxy-links" viewBox="0 0 880 640" preserveAspectRatio="none">
    <line x1="440" y1="320" x2="140" y2="100" stroke="rgba(212,175,106,0.20)" stroke-width="1"/>
    <line x1="440" y1="320" x2="740" y2="100" stroke="rgba(212,175,106,0.20)" stroke-width="1"/>
    <line x1="440" y1="320" x2="120" y2="420" stroke="rgba(212,175,106,0.20)" stroke-width="1"/>
    <line x1="440" y1="320" x2="760" y2="420" stroke="rgba(212,175,106,0.20)" stroke-width="1"/>
    <line x1="440" y1="320" x2="80" y2="250" stroke="rgba(212,175,106,0.16)" stroke-width="1"/>
    <line x1="440" y1="320" x2="800" y2="250" stroke="rgba(212,175,106,0.16)" stroke-width="1"/>
    <line x1="440" y1="320" x2="440" y2="40" stroke="rgba(212,175,106,0.20)" stroke-width="1"/>
    <circle cx="440" cy="320" r="215" fill="none" stroke="rgba(212,175,106,0.10)" stroke-width="1"/>
  </svg>`;
  html = html.slice(0, oldSvgStart) + newSvg + html.slice(oldSvgEnd);
  console.log('✅ SVG 连接线更新');
}

// 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ v18 完成！大小:', (html.length / 1024).toFixed(1), 'KB');
