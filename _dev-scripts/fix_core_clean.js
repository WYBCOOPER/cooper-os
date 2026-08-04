// 精简月亮圆盘：只保留 时钟+日期+标签+聚焦，隐藏天气/添加/DDL（避免挤爆）
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

const fixCSS = `
  /* ===== 月亮圆盘精简：只留核心内容，防拥挤 ===== */
  .galaxy-core {
    gap: 0 !important;
    padding: 10px 12px !important;
  }
  /* 时钟加大醒目 */
  .core-time {
    font-size: clamp(30px, 3.6vw, 44px) !important;
    color: #f5e6c4 !important;
    text-shadow: 0 0 40px rgba(232,201,143,0.7), 0 2px 8px rgba(0,0,0,0.5) !important;
    line-height: 1 !important;
  }
  .core-date {
    font-size: clamp(9px, 1.1vw, 12px) !important;
    color: rgba(255,255,255,0.85) !important;
    letter-spacing: .22em !important;
    margin-top: 6px !important;
  }
  .core-label {
    font-size: clamp(8px, .9vw, 10px) !important;
    color: #e8c98f !important;
    letter-spacing: .3em !important;
    margin-top: 7px !important;
  }
  /* 聚焦：一行小胶囊，不占太多 */
  .core-focus {
    margin-top: 8px !important;
    font-size: clamp(9px, 1vw, 11px) !important;
    max-width: 92% !important;
  }
  .core-focus .focus-item, .core-focus .deck-focus-item {
    font-size: clamp(9px, 1vw, 11px) !important;
    padding: 3px 10px !important;
  }
  /* 天气/添加/DDL 从圆盘里移除（下面主界面已有展示） */
  .core-weather { display: none !important; }
  .core-add { display: none !important; }
  .core-ddl { display: none !important; }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + fixCSS + '\n' + s.slice(styleEnd);
console.log('✅ 精简 CSS 已注入');

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');

fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
