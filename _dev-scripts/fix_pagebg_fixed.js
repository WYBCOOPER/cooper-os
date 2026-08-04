// 最稳方案：独立全屏背景层（position:fixed），雪山 100% 铺满
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 1. 注入背景层 CSS
const bgCSS = `
  /* ===== 独立全屏雪山背景层（最稳：fixed + z-index:-1）===== */
  .page-bg {
    position: fixed !important;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: -1 !important;
    background: url('snow_peaks_v6.png') center center / cover no-repeat !important;
  }
  /* body 降级为深蓝纯色（背景层之上所有内容透明） */
  body {
    background: #0a1226 !important;
  }
  /* 所有大容器透明化，让背景层透出 */
  .shell, .statusbar, .command-deck, .galaxy {
    background: transparent !important;
  }
  /* 卡片轻半透明（内容仍清晰可读） */
  .card, .module, .panel, section, .grid > * {
    background: rgba(13,20,42,0.45) !important;
  }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + bgCSS + '\n' + s.slice(styleEnd);
console.log('✅ 背景层 CSS 已注入');

// 2. 在 <body> 后插入背景层 div
const bodyStart = s.indexOf('<body>');
if (bodyStart < 0) { console.error('❌ 未找到 <body>'); process.exit(1); }
const insertAt = bodyStart + '<body>'.length;
s = s.slice(0, insertAt) + '\n<div class="page-bg"></div>' + s.slice(insertAt);
console.log('✅ 背景层 div 已插入');

// 3. galaxy 内的重复雪山图改为透明（背景层已提供）
s = s.replace(/\.galaxy-bg\s*\{[^}]*\}/g, '.galaxy-bg { opacity: 0 !important; }');
console.log('✅ galaxy 内重复图已透明化');

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
