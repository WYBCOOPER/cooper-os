// galaxy 全面自检
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. 花括号平衡（CSS+JS）
let bal = 0, firstNeg = -1;
for (let i = 0; i < html.length; i++) {
  const ch = html[i];
  if (ch === '{') bal++;
  if (ch === '}') { bal--; if (bal < 0 && firstNeg < 0) firstNeg = i; }
}
console.log('花括号:', bal === 0 ? '✅' : `❌ ${bal} (首次负@${firstNeg})`);

// 2. 圆括号平衡（JS）
let bal2 = 0, firstNeg2 = -1;
for (let i = 0; i < html.length; i++) {
  const ch = html[i];
  if (ch === '(') bal2++;
  if (ch === ')') { bal2--; if (bal2 < 0 && firstNeg2 < 0) firstNeg2 = i; }
}
console.log('圆括号:', bal2 === 0 ? '✅' : `❌ ${bal2} (首次负@${firstNeg2})`);

// 3. 提取 JS 用 node --check 验证语法
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/g);
console.log('script 块数:', scriptMatch ? scriptMatch.length : 0);
if (scriptMatch) {
  let allJs = '';
  scriptMatch.forEach(s => {
    const inner = s.replace(/^<script>/, '').replace(/<\/script>$/, '');
    allJs += inner + '\n';
  });
  fs.writeFileSync('C:/Users/wyb/Desktop/草哥工作台/_galaxy_check.js', allJs);
  console.log('JS 已提取到 _galaxy_check.js，长度:', allJs.length);
}

// 4. 关键功能检查
const checks = {
  '星系外壳': html.includes('class="galaxy"') && html.includes('galaxy-core'),
  '7 颗卫星': (html.match(/class="sat sat-/g) || []).length === 7,
  '轨道动画': html.includes('orbitSpin'),
  '黑金配色': html.includes('#d4af6a') || html.includes('212,175,106'),
  '核心同步脚本': html.includes('deck-time2'),
  'openDrawer 函数': html.includes('function openDrawer'),
  '抽屉保留': html.includes('id="d1"') && html.includes('id="d7"'),
  '隐藏指挥台': html.includes('display:none!important'),
  'store 键保留': html.includes('cg_todos') && html.includes('cg_focus'),
};
for (const [k, v] of Object.entries(checks)) console.log(v ? '✅' : '❌', k);

// 5. div 标签配平粗查
let divOpen = (html.match(/<div[\s>]/g) || []).length;
let divClose = (html.match(/<\/div>/g) || []).length;
console.log('div 标签: 开', divOpen, '闭', divClose, divOpen === divClose ? '✅' : '⚠️ 差 ' + (divOpen - divClose));
