// 修复：恢复 galaxy 场景区雪山图（按钮对准峰顶）+ body 背景延伸（无缝）
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 1. 恢复 galaxy-bg 显示（之前被透明化）
s = s.replace(/\.galaxy-bg\s*\{[^}]*\}/g, `.galaxy-bg {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; z-index: 0;
    border-radius: 18px;
    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%) !important;
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%) !important;
  }`);
console.log('✅ galaxy 场景区雪山图已恢复（按钮回到峰顶）');

// 2. 确保 galaxy 容器有背景且不透明层遮挡
const galaxyFix = `
  /* galaxy 场景区：正常显示（按钮对准峰顶） */
  .galaxy {
    background: transparent !important;
  }
  /* 背景层保留（下方延伸），但 galaxy 顶部优先显示场景图 */
  .page-bg {
    background: url('snow_peaks_v6.png') center center / cover no-repeat !important;
  }
  /* 银河容器下方内容半透明透出背景层 */
  .shell { background: transparent !important; }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + galaxyFix + '\n' + s.slice(styleEnd);
console.log('✅ galaxy 样式已修正');

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
