// COOPER OS 界面大改造 Step 2：状态栏 + 按钮 + 手机端
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// ===== 1. 状态栏：毛玻璃 + 金色细边框 =====
const oldSb = html.match(/\.statusbar\s*\{[\s\S]*?\n  \}/);
if (oldSb) {
  const newSb = `.statusbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; gap: 18px;
    padding: 14px 4px; margin-bottom: 8px;
    backdrop-filter: blur(24px) saturate(1.3);
    background: rgba(5,6,10,0.55);
    border-bottom: 1px solid rgba(212,175,106,0.14);
    font-size: 13px;
  }`;
  html = html.replace(oldSb[0], newSb);
  console.log('✅ 状态栏已升级');
}

// ===== 2. capture-btn（金色按钮）=====
const oldCap = html.match(/\.capture-btn\s*\{[\s\S]*?\n  \}/);
if (oldCap) {
  const newCap = `.capture-btn {
    padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(212,175,106,0.3);
    background: var(--accent-soft); color: var(--accent); font-size: 12px; cursor: pointer;
    font-weight: 600; transition: all .2s;
  }
  .capture-btn:hover { background: var(--accent); color: #05060a; }`;
  html = html.replace(oldCap[0], newCap);
  console.log('✅ capture-btn 已升级');
}

// ===== 3. help-btn =====
const oldHelp = html.match(/\.help-btn\s*\{[\s\S]*?\n  \}/);
if (oldHelp) {
  const newHelp = `.help-btn {
    padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(212,175,106,0.2);
    background: transparent; color: var(--text-dim); font-size: 12px; cursor: pointer;
    transition: all .2s; white-space: nowrap;
  }
  .help-btn:hover { border-color: var(--accent); color: var(--accent); }`;
  html = html.replace(oldHelp[0], newHelp);
  console.log('✅ help-btn 已升级');
}

// ===== 4. 手机端 media query 增强（底部留白 + 卡片优化）=====
// 在 @media 760px 里的 .card 规则后追加手机专属样式
const mobileAnchor = `@media (max-width: 760px) {`;
if (html.includes(mobileAnchor)) {
  // 追加手机端增强样式（插到 media query 开头）
  const mobileEnhance = `@media (max-width: 760px) {
    /* ===== 手机增强：深空星云 ===== */
    .shell { padding-bottom: 120px; }
    .card { border-radius: 18px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 24px rgba(0,0,0,0.3); }
    .statusbar { background: rgba(5,6,10,0.72); }
    .capture-btn { padding: 10px 18px; font-size: 13px; }
    .drawer-btn { min-height: 46px; }
    /* 底部安全区 */
    .drawer-nav { padding-bottom: env(safe-area-inset-bottom); }
    /* 金色滚动条 */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(212,175,106,0.25); border-radius: 4px; }
`;
  html = html.replace(mobileAnchor, mobileEnhance);
  console.log('✅ 手机端增强已插入');
}

fs.writeFileSync(path, html);
console.log('✅ Step 2 完成');
