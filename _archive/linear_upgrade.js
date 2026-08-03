// COOPER OS Linear 风格升级（在深空星云基础上叠加 Linear 元素）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/new_design.css';
let css = fs.readFileSync(path, 'utf8');

// ===== 1. 微噪点层（Linear 高级质感核心）=====
const noiseLayer = `
  /* Linear 微噪点层（纯 SVG 数据 URI，无外部依赖） */
  body::after {
    content:''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
    opacity: 0.05; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 140px 140px;
  }
`;

// 把噪点层加在 body::after 定义前（或者直接替换原来的星星背景，保留星星，噪点叠加在后面）
// 在 body::after 的星星定义后面追加噪点（通过增加第二个伪元素不可行，改为在星星背景上叠加）
// 方案：替换整个 body::after 为 星星 + 噪点 合并
const oldAfter = css.match(/body::after\s*\{[\s\S]*?\n  \}/);
if (oldAfter) {
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
      radial-gradient(1px 1px at 48% 33%, rgba(240,230,210,0.25) 50%, transparent 51%),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: auto, auto, auto, auto, auto, auto, auto, auto, auto, auto, auto, auto, 140px 140px;
    opacity: 0.9;
  }`;
  css = css.replace(oldAfter[0], newAfter);
  console.log('✅ 微噪点层已叠加（星星 + SVG 噪点）');
}

// ===== 2. 卡片：极细描边（Linear 风格：灰白细线替代金色粗线）=====
const oldCard = css.match(/\.card\s*\{[\s\S]*?\n  \}\n  \.card::before[\s\S]*?\n  \}/);
if (oldCard) {
  const newCard = `.card {
    background: var(--card); border: 1px solid rgba(255,255,255,0.06);
    border-radius: var(--radius); padding: 24px;
    backdrop-filter: blur(24px) saturate(1.25);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.3);
    transition: background .3s, border-color .3s var(--ease), transform .25s var(--ease);
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content:''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,106,0.25), transparent);
    opacity: 0; transition: opacity .3s;
  }
  .card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); }
  .card:hover::before { opacity: 1; }`;
  css = css.replace(oldCard[0], newCard);
  console.log('✅ 卡片改为极细灰白描边（金色仅 hover 顶部微光）');
}

// ===== 3. 金色降级为点缀：accent 变量调整 =====
// 保持 --accent 金色，但文字主色偏中性（Linear 感）
const oldRoot = css.match(/:root\s*\{[^}]*\}/);
if (oldRoot) {
  const newRoot = `:root {
    --bg: #05060a;
    --bg2: #0a0d16;
    --card: rgba(13, 16, 25, 0.72);
    --card-strong: rgba(17, 21, 32, 0.94);
    --border: rgba(255,255,255,0.06);
    --border-strong: rgba(255,255,255,0.14);
    --text: #eef0f6;
    --text-dim: #8b93a7;
    --text-faint: #5d6475;
    --accent: #d4af6a;
    --accent2: #e8c98f;
    --accent-soft: rgba(212,175,106,0.10);
    --green: #4fe3c1;
    --yellow: #ffc857;
    --red: #ff7a94;
    --radius: 16px;
    --radius-sm: 10px;
    --mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;
    --font-display: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    --shadow-lg: 0 12px 48px rgba(0,0,0,0.5);
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
  }`;
  css = css.replace(oldRoot[0], newRoot);
  console.log('✅ 变量更新：极细边框 + 金色降为点缀');
}

// ===== 4. 状态栏描边细化 =====
const oldSb = css.match(/\.statusbar\s*\{[\s\S]*?\n  \}/);
if (oldSb) {
  const newSb = `.statusbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; gap: 18px;
    padding: 14px 6px; margin-bottom: 6px;
    backdrop-filter: blur(24px) saturate(1.4);
    background: rgba(5,6,10,0.45);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 13px;
  }`;
  css = css.replace(oldSb[0], newSb);
  console.log('✅ 状态栏极细描边');
}

// ===== 5. 抽屉导航描边细化 =====
const oldNav = css.match(/\.drawer-nav\s*\{[\s\S]*?\n  \}/);
if (oldNav) {
  const newNav = `.drawer-nav {
    position: sticky; top: 58px; z-index: 90;
    display: flex; gap: 8px; margin: 12px 0 26px; flex-wrap: wrap;
    backdrop-filter: blur(18px) saturate(1.3);
    background: rgba(10,12,20,0.5);
    padding: 8px; border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }`;
  css = css.replace(oldNav[0], newNav);
  console.log('✅ 抽屉导航极细描边');
}

fs.writeFileSync(path, css);
console.log('\n✅ Linear 风格升级完成！');
