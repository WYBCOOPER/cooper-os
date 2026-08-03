// 全局黑金换色 v6：把页面所有蓝色系替换为金色，贴合概念图
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

let count = 0;

// ============ 1. 核心变量替换 ============
// 找 :root 定义
const rootMatch = html.match(/:root\s*\{[^}]*\}/);
if (rootMatch) {
  console.log('=== 当前 :root ===');
  console.log(rootMatch[0].slice(0, 600));
}

// ============ 2. 蓝色引用 → 金色（全局替换） ============
// 颜色值替换映射（保留透明度数值）
const blueToGold = [
  ['rgba(79,141,255,', 'rgba(212,175,106,'],   // 主蓝 → 金
  ['rgba(96,140,255,', 'rgba(212,175,106,'],   // 浅蓝 → 金
  ['rgba(100,150,255,', 'rgba(212,175,106,'],  // 变体
  ['rgba(52,95,180,', 'rgba(160,130,80,'],     // 深蓝 → 深金
  ['#4f8dff', '#d4af6a'],
  ['#6090ff', '#d4af6a'],
  ['#3d6bff', '#c9a25c'],
  ['#5d8eff', '#d4af6a'],
  ['#79a8ff', '#e0c087'],
  ['#041020', '#0a0a0d'],   // 深蓝黑底 → 纯黑
  ['#0a1220', '#0b0c10'],   // 蓝黑 → 黑
  ['#0d1526', '#0e0f14'],
  ['#101a30', '#111218'],
  ['#0b1428', '#0d0e13'],
  ['#f0f5ff', '#f2ead8'],   // 亮白蓝 → 暖白
];

blueToGold.forEach(([b, g]) => {
  const before = (html.match(new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (before > 0) {
    html = html.split(b).join(g);
    count += before;
    console.log(`替换 ${b} → ${g} (${before} 处)`);
  }
});

// ============ 3. 变量定义替换 ============
// --accent 已经是金色就不用动，但 --accent2/--accent-soft/--text 等检查
const varReplace = [
  ['--accent2: #4f8dff', '--accent2: #e8c98f'],
  ['--accent2: #5d8eff', '--accent2: #e8c98f'],
  ['--accent-soft: rgba(79,141,255,0.14)', '--accent-soft: rgba(212,175,106,0.12)'],
  ['--accent-soft: rgba(79,141,255,0.12)', '--accent-soft: rgba(212,175,106,0.10)'],
];
varReplace.forEach(([b, g]) => {
  if (html.includes(b)) { html = html.split(b).join(g); count++; console.log(`变量: ${b} → ${g}`); }
});

// ============ 4. 时钟光晕 ============
html = html.split('text-shadow: 0 0 60px rgba(79,141,255,0.3)').join('text-shadow: 0 0 60px rgba(212,175,106,0.35)');
html = html.split('text-shadow: 0 0 40px rgba(79,141,255,0.25)').join('text-shadow: 0 0 40px rgba(212,175,106,0.3)');

// ============ 5. 按钮/悬停蓝 → 金 ============
html = html.split('.drawer-btn:hover { color: var(--text); background: rgba(96,140,255,0.08); }').join('.drawer-btn:hover { color: var(--text); background: rgba(212,175,106,0.10); }');
html = html.split('.card:hover { background: var(--card-strong); border-color: rgba(96,140,255,0.24').join('.card:hover { background: var(--card-strong); border-color: rgba(212,175,106,0.28');
html = html.split('.mini-btn.ghost { background: rgba(96,140,255,0.1);').join('.mini-btn.ghost { background: rgba(212,175,106,0.1);');
html = html.split('.c-drop-menu .c-drop-opt:hover { background: rgba(79,141,255,0.15); }').join('.c-drop-menu .c-drop-opt:hover { background: rgba(212,175,106,0.15); }');

// ============ 6. 轨道线加粗（贴合概念图：明显金色轨道） ============
html = html.replace('.orbit { position: absolute; border: 1px solid rgba(212,175,106,0.13); border-radius: 50%; pointer-events: none; }',
  '.orbit { position: absolute; border: 1.5px solid rgba(212,175,106,0.35); border-radius: 50%; pointer-events: none; box-shadow: 0 0 12px rgba(212,175,106,0.08) inset, 0 0 20px rgba(212,175,106,0.05); }');

// ============ 7. 校验 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('\n花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

// 检查残留蓝色
const remain = html.match(/rgba\(79,141,255|rgba\(96,140,255|#4f8dff|#5d8eff|#6090ff/g);
console.log('残留蓝色引用:', remain ? remain.length + ' 处' : '✅ 无');

fs.writeFileSync(path, html);
console.log(`\n✅ 全局黑金换色完成！共替换 ${count} 处`);
