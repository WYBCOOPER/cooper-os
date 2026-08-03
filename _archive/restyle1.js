// COOPER OS 界面大改造：A+B 深空星云主题（Step 1：核心视觉）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ===== 1. 替换 :root 变量（深空黑 + 金线 accent）=====
const oldRoot = html.match(/:root\s*\{[^}]*\}/);
if (!oldRoot) { console.log('❌ :root 未找到'); process.exit(1); }
const newRoot = `:root {
    --bg: #05060a;
    --card: rgba(14, 17, 26, 0.66);
    --card-strong: rgba(18, 22, 33, 0.92);
    --border: rgba(212, 175, 106, 0.16);
    --text: #eceef4;
    --text-dim: #9aa3b5;
    --text-faint: #5d6475;
    --accent: #d4af6a;
    --accent2: #e8c98f;
    --accent-soft: rgba(212,175,106,0.13);
    --green: #4fe3c1;
    --yellow: #ffc857;
    --red: #ff7a94;
    --radius: 20px;
    --mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  }`;
html = html.replace(oldRoot[0], newRoot);

// ===== 2. 替换 body::before（星云背景）=====
const oldBefore = html.match(/body::before\s*\{[\s\S]*?\n  \}/);
if (!oldBefore) { console.log('❌ body::before 未找到'); process.exit(1); }
const newBefore = `body::before {
    content:''; position: fixed; inset: 0; z-index: -2;
    background:
      radial-gradient(ellipse 70% 45% at 50% -12%, rgba(58,84,140,0.26), transparent),
      radial-gradient(ellipse 45% 35% at 88% 92%, rgba(110,90,60,0.14), transparent),
      radial-gradient(ellipse 50% 38% at 8% 62%, rgba(46,72,128,0.13), transparent),
      radial-gradient(ellipse 30% 25% at 68% 15%, rgba(212,175,106,0.05), transparent),
      var(--bg);
  }`;
html = html.replace(oldBefore[0], newBefore);

// ===== 3. 替换 body::after（星星 + 微光粒子，金色调）=====
const oldAfter = html.match(/body::after\s*\{[\s\S]*?\n  \}/);
if (!oldAfter) { console.log('❌ body::after 未找到'); process.exit(1); }
const newAfter = `body::after {
    content:''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background-image:
      radial-gradient(1px 1px at 12% 22%, rgba(240,230,210,0.5) 50%, transparent 51%),
      radial-gradient(1px 1px at 32% 68%, rgba(240,230,210,0.32) 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 55% 12%, rgba(240,230,210,0.42) 50%, transparent 51%),
      radial-gradient(1px 1px at 72% 44%, rgba(240,230,210,0.28) 50%, transparent 51%),
      radial-gradient(1px 1px at 85% 80%, rgba(240,230,210,0.36) 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 42% 90%, rgba(240,230,210,0.28) 50%, transparent 51%),
      radial-gradient(1px 1px at 8% 85%, rgba(240,230,210,0.32) 50%, transparent 51%),
      radial-gradient(1px 1px at 93% 30%, rgba(240,230,210,0.36) 50%, transparent 51%),
      radial-gradient(1px 1px at 63% 55%, rgba(240,230,210,0.22) 50%, transparent 51%),
      radial-gradient(1px 1px at 25% 40%, rgba(240,230,210,0.28) 50%, transparent 51%),
      radial-gradient(1.2px 1.2px at 78% 92%, rgba(240,230,210,0.32) 50%, transparent 51%),
      radial-gradient(1px 1px at 48% 33%, rgba(240,230,210,0.25) 50%, transparent 51%);
  }`;
html = html.replace(oldAfter[0], newAfter);

// ===== 4. 替换 .card（Liquid Glass：内边框 + 内阴影 + 金色细边）=====
const oldCard = html.match(/\.card\s*\{[\s\S]*?\n  \}/);
if (!oldCard) { console.log('❌ .card 未找到'); process.exit(1); }
const newCard = `.card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 22px;
    backdrop-filter: blur(24px) saturate(1.2);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.35);
    transition: background .3s, border-color .3s, transform .2s;
  }
  .card:hover { border-color: rgba(212,175,106,0.3); }`;
html = html.replace(oldCard[0], newCard);

fs.writeFileSync(path, html);
console.log('✅ Step 1 完成：:root + 背景星云 + Liquid Glass 卡片已替换');
console.log('新 accent:', '#d4af6a（细金线）');
