// 清理可见元素的毛玻璃（宝宝禁止 AI 苹果风），弹窗保留合理分层
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 在覆盖 CSS 末尾追加毛玻璃清理
const glassFix = `
  /* ===== 毛玻璃清理（宝宝禁止 AI 苹果风）===== */
  .statusbar { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
  .deck-focus-item { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
  .drawer-nav { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
  .card { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + glassFix + '\n' + s.slice(styleEnd);
console.log('✅ 毛玻璃清理已注入');

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
