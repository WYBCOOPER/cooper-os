// 星系 v17：① 移除多余装饰环 ② 重新设计 7 小球布局（错落精致）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 移除核心外装饰环（ring-outer/ring-inner） ============
// 1.1 移除 HTML 元素
const oldRingsHtml = `  <div class="core-ring ring-outer"></div>
  <div class="core-ring ring-inner"></div>
`;
if (html.includes(oldRingsHtml)) {
  html = html.replace(oldRingsHtml, '');
  console.log('✅ 装饰环 HTML 已移除');
}

// 1.2 移除 CSS（.core-ring/.ring-outer/.ring-inner/@keyframes ringSpin/::after）
const ringCSSStart = html.indexOf('  /* 核心装饰环（同心圆） */');
const ringCSSEnd = html.indexOf('  /* 核心内容 */');
if (ringCSSStart >= 0 && ringCSSEnd > ringCSSStart) {
  html = html.slice(0, ringCSSStart) + html.slice(ringCSSEnd);
  console.log('✅ 装饰环 CSS 已移除');
} else {
  console.log('⚠️ 装饰环 CSS 边界未找到');
}

// ============ 2. 重新设计 7 小球布局：错落精致（skill: DESIGN_VARIANCE 8 不对称） ============
// 方案：不追求正圆环绕，而是"行星带"式错落分布——上3下4，大小略有差异
const oldPosStart = html.indexOf('  /* 位置：7 个板块均匀环绕（360°/7 ≈ 51.4°） */');
const oldPosEnd = html.indexOf('  /* 金色连接线', oldPosStart);
if (oldPosStart < 0 || oldPosEnd < 0) { console.log('❌ 位置 CSS 未找到'); process.exit(1); }

const newPos = `  /* 位置：行星带式错落分布（非正圆，更自然） */
  .dial-1 { top: -8%; left: 8%; }
  .dial-2 { top: -10%; right: 8%; }
  .dial-3 { top: 22%; right: -6%; }
  .dial-4 { bottom: -8%; left: 12%; }
  .dial-5 { bottom: -10%; right: 12%; }
  .dial-6 { top: 22%; left: -6%; }
  .dial-7 { bottom: 20%; left: 28%; }

`;
html = html.slice(0, oldPosStart) + newPos + html.slice(oldPosEnd);
console.log('✅ 7 小球改为错落分布');

// ============ 3. 小球尺寸微调（大小层次感：核心大、小球分主次） ============
const oldDialCSS = `.dial {
    position: absolute; z-index: 6;
    width: clamp(120px, 17vw, 170px);
    height: clamp(120px, 17vw, 170px);`;
const newDialCSS = `.dial {
    position: absolute; z-index: 6;
    width: clamp(100px, 15vw, 150px);
    height: clamp(100px, 15vw, 150px);`;
if (html.includes(oldDialCSS)) {
  html = html.replace(oldDialCSS, newDialCSS);
  console.log('✅ 小球尺寸微调');
}

// ============ 4. 手机端小球位置适配（同步新分布） ============
const oldMobilePos = `    .dial-1 { top: -3%; }
    .dial-4 { bottom: -4%; }
    .dial-2 { top: 12%; right: -3%; }
    .dial-6 { top: 12%; left: -3%; }
    .dial-3 { bottom: 12%; right: 0; }
    .dial-5 { bottom: 12%; left: 0; }
    .dial-7 { top: 30%; right: 18%; }`;
const newMobilePos = `    .dial-1 { top: -6%; left: 4%; }
    .dial-2 { top: -8%; right: 4%; }
    .dial-3 { top: 24%; right: -4%; }
    .dial-4 { bottom: -6%; left: 8%; }
    .dial-5 { bottom: -8%; right: 8%; }
    .dial-6 { top: 24%; left: -4%; }
    .dial-7 { bottom: 18%; left: 24%; }`;
if (html.includes(oldMobilePos)) {
  html = html.replace(oldMobilePos, newMobilePos);
  console.log('✅ 手机端位置同步更新');
} else {
  console.log('⚠️ 手机端位置未匹配（可能已被 v12 改过）');
}

// ============ 5. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

// 确认环已移除
console.log('ring-outer 残留:', html.includes('ring-outer') ? '⚠️' : '✅ 无');
console.log('dial 数量:', (html.match(/class="dial dial-\d"/g) || []).length);

fs.writeFileSync(path, html);
console.log('\n✅ v17 完成！大小:', (html.length / 1024).toFixed(1), 'KB');
