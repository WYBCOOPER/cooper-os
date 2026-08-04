// 关键修复：雪山铺满整个 body 背景，下面不再漆黑一片
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

const bodyBgCSS = `
  /* ===== 关键：雪山铺满整个页面背景（body 级）===== */
  body {
    background:
      linear-gradient(to bottom, rgba(6,10,22,0.15) 0%, rgba(6,10,22,0.55) 55%, rgba(6,10,22,0.88) 100%),
      url('snow_peaks_v6.png') center top / cover no-repeat fixed !important;
    background-size: cover !important;
    background-attachment: fixed !important;
  }
  /* 内容容器：半透明深蓝，让雪山透出 */
  .shell {
    background: rgba(6,10,22,0.35) !important;
    border-radius: 0 !important;
  }
  /* 下方模块卡片：半透明，雪山透出 */
  .card, .module, .panel, section {
    background: rgba(14,22,44,0.55) !important;
  }
  /* 状态栏半透明 */
  .statusbar {
    background: linear-gradient(to bottom, rgba(6,10,22,0.6), transparent) !important;
  }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + bodyBgCSS + '\n' + s.slice(styleEnd);
console.log('✅ 雪山全屏背景已注入');

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
