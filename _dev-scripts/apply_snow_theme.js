// COOPER OS 重做：应用 DESIGN_SYSTEM 雪山星空主题（只改 CSS，不动 JS）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ============ 1. 替换 :root 配色变量 ============
const oldRoot = html.match(/:root\s*\{[^}]*\}/);
if (!oldRoot) { console.log('❌ 找不到 :root'); process.exit(1); }
console.log('原 :root:', oldRoot[0].slice(0, 120).replace(/\n/g, ' '));

const newRoot = `:root {
    --bg: #0B1220;
    --bg-deep: #0B1220;
    --card: rgba(27, 42, 74, 0.72);
    --card-strong: rgba(27, 42, 74, 0.94);
    --surface: #1B2A4A;
    --surface-2: #243554;
    --border: rgba(232, 236, 245, 0.08);
    --border-strong: rgba(232, 236, 245, 0.16);
    --text: #F5F7FA;
    --text-dim: #A8B4C8;
    --text-faint: #6B7A93;
    --accent: #8FB8E8;
    --accent-warm: #D4AF6A;
    --accent-soft: rgba(143, 184, 232, 0.12);
    --sunset-a: #FF6B00;
    --sunset-b: #FF8C00;
    --sunset-c: #FFB347;
    --green: #4fe3c1;
    --yellow: #FFC857;
    --red: #FF7A94;
    --radius: 18px;
    --radius-sm: 10px;
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
    --mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;
    --font-display: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    --shadow-lg: 0 12px 48px rgba(0,0,0,0.45);
  }`;
html = html.replace(oldRoot[0], newRoot);
console.log('✅ :root 已改为雪山星空主题');

// ============ 2. 替换 body 背景（星野渐变） ============
const bodyStart = html.indexOf('body {');
const bodyEnd = html.indexOf('\n  }', bodyStart) + 4;
if (bodyStart >= 0) {
  const newBody = `body {
    background: var(--bg); color: var(--text);
    font-family: var(--font-display);
    min-height: 100vh;
  }`;
  html = html.slice(0, bodyStart) + newBody + html.slice(bodyEnd);
  console.log('✅ body 已更新');
}

// ============ 3. body::before 星野背景 ============
const beforeStart = html.indexOf('body::before {');
const beforeEnd = html.indexOf('\n  }', beforeStart) + 4;
if (beforeStart >= 0) {
  const newBefore = `body::before {
    content:''; position: fixed; inset: 0; z-index: -2;
    background:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(143,184,232,0.08), transparent),
      radial-gradient(ellipse 60% 40% at 85% 100%, rgba(255,140,0,0.05), transparent),
      radial-gradient(ellipse 50% 40% at 10% 60%, rgba(27,42,74,0.5), transparent);
    background-color: #0B1220;
  }`;
  html = html.slice(0, beforeStart) + newBefore + html.slice(beforeEnd);
  console.log('✅ body::before 星野背景已应用');
}

// ============ 4. body::after 星点（保留并调整） ============
const afterStart = html.indexOf('body::after {');
if (afterStart >= 0) {
  const afterEnd = html.indexOf('\n  }', afterStart) + 4;
  const newAfter = `body::after {
    content:''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
    opacity: 0.5;
    background-image:
      radial-gradient(1px 1px at 12% 22%, #F5F7FA 50%, transparent),
      radial-gradient(1px 1px at 32% 68%, rgba(245,247,250,0.6) 50%, transparent),
      radial-gradient(1.5px 1.5px at 55% 12%, rgba(245,247,250,0.7) 50%, transparent),
      radial-gradient(1px 1px at 72% 44%, rgba(245,247,250,0.5) 50%, transparent),
      radial-gradient(1px 1px at 85% 80%, rgba(245,247,250,0.6) 50%, transparent),
      radial-gradient(1px 1px at 42% 90%, rgba(143,184,232,0.5) 50%, transparent);
  }`;
  html = html.slice(0, afterStart) + newAfter + html.slice(afterEnd);
  console.log('✅ body::after 星点已调整');
}

// ============ 5. 卡片材质（冰川玻璃） ============
const cardStart = html.indexOf('.card {');
if (cardStart >= 0) {
  const cardEnd = html.indexOf('\n  }', cardStart) + 4;
  const newCard = `.card {
    background: linear-gradient(160deg, rgba(27,42,74,0.9), rgba(16,24,40,0.95));
    border: 1px solid rgba(232,236,245,0.08);
    border-radius: var(--radius);
    padding: 22px;
    backdrop-filter: blur(20px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 40px rgba(0,0,0,0.35);
    transition: transform .25s var(--ease), border-color .25s;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content:''; position: absolute; top:0; left:10%; right:10%; height:1px;
    background: linear-gradient(90deg, transparent, rgba(255,140,0,0.4), transparent);
    opacity: 0; transition: opacity .3s;
  }
  .card:hover { transform: translateY(-2px); border-color: rgba(255,140,0,0.3); }
  .card:hover::before { opacity: 1; }`;
  html = html.slice(0, cardStart) + newCard + html.slice(cardEnd);
  console.log('✅ 卡片改为冰川玻璃 + 落日光');
}

// ============ 6. 按钮主色调（落日渐变） ============
// 找主按钮（mini-btn 或类似），把 accent 相关按钮改为落日金
// 简单方案：把 --accent 的应用保持（冰蓝），但 .btn-primary 类如果有就改
// 先检查有没有 .btn-primary
const btnIdx = html.indexOf('.btn-primary');
console.log(btnIdx >= 0 ? '✅ 有 .btn-primary' : 'ℹ️ 无 .btn-primary（用现有按钮类）');

// 把 accent 相关金色微调：hover 时用落日色
html = html.split('--accent-soft: rgba(143, 184, 232, 0.12)').join('--accent-soft: rgba(143, 184, 232, 0.12)');

// ============ 7. 校验括号 ============
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ 雪山星空主题应用完成！大小:', (html.length / 1024).toFixed(1), 'KB');
