// 抽屉面板背景：雪山氛围（半透明深蓝渐变 + 微光），跟主界面呼应
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

const drawerCSS = `
  /* ===== 抽屉面板背景：雪山氛围（不再是漆黑一片）===== */
  .drawer {
    background:
      radial-gradient(ellipse at 50% 0%, rgba(59,86,138,0.20), transparent 55%),
      radial-gradient(ellipse at 50% 100%, rgba(232,201,143,0.06), transparent 45%),
      linear-gradient(to bottom, rgba(9,13,26,0.92), rgba(6,10,22,0.96)) !important;
    border-radius: 20px !important;
    border: 1px solid rgba(232,201,143,0.12) !important;
    padding: 22px !important;
    margin-top: 18px !important;
    box-shadow: 0 18px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04) !important;
  }
  /* 卡片：半透明深蓝，跟雪山冷色统一 */
  .drawer .card {
    background: rgba(16,22,40,0.72) !important;
    border: 1px solid rgba(255,255,255,0.07) !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
  }
  /* 标题：金色点缀（跟月亮标签一致） */
  .drawer .drawer-title, .drawer h2, .drawer h3 {
    color: #e8c98f !important;
  }
  /* 输入框：深蓝底 */
  .drawer input, .drawer textarea, .drawer select {
    background: rgba(9,13,26,0.7) !important;
    border-color: rgba(255,255,255,0.14) !important;
    color: #fff !important;
  }
  /* 滚动条样式微调 */
  .drawer ::-webkit-scrollbar { width: 8px; }
  .drawer ::-webkit-scrollbar-thumb { background: rgba(232,201,143,0.25); border-radius: 4px; }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + drawerCSS + '\n' + s.slice(styleEnd);
console.log('✅ 抽屉背景样式已注入');

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
