// 全屏水印遮罩：固定右下角，盖住背景层水印
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 1. 注入水印遮罩 CSS（fixed 右下角，夜色融合）
const wmCSS = `
  /* ===== 全屏水印遮罩：盖住背景层右下角 AI生成 水印 ===== */
  .wm-cover {
    position: fixed !important;
    right: 0; bottom: 0;
    width: 220px; height: 60px;
    background: linear-gradient(to top left, rgba(6,10,22,0.85) 0%, rgba(6,10,22,0.55) 55%, transparent 100%) !important;
    z-index: 9999 !important;
    pointer-events: none !important;
    border-radius: 12px 0 0 0 !important;
  }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + wmCSS + '\n' + s.slice(styleEnd);
console.log('✅ 全屏水印遮罩 CSS 已注入');

// 2. 在 <body> 后插入水印遮罩 div
const bodyStart = s.indexOf('<body>');
if (bodyStart < 0) { console.error('❌ 未找到 <body>'); process.exit(1); }
const insertAt = bodyStart + '<body>'.length;
// 找到 page-bg div 插入位置
const pgIdx = s.indexOf('<div class="page-bg"></div>');
if (pgIdx >= 0) {
  s = s.slice(0, pgIdx) + '<div class="page-bg"></div>\n<div class="wm-cover"></div>' + s.slice(pgIdx + '<div class="page-bg"></div>'.length);
  console.log('✅ 水印遮罩 div 已插入');
} else {
  s = s.slice(0, insertAt) + '\n<div class="wm-cover"></div>' + s.slice(insertAt);
  console.log('✅ 水印遮罩 div 已插入（body 后）');
}

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
