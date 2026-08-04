// 修复：雪山底部渐隐融入 + 水印遮挡
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 在覆盖 CSS 中追加修复样式
const fixCSS = `
  /* ===== 修复：雪山底部渐隐融入（消除上下割裂 + 水印） ===== */
  .galaxy {
    background: #060a16 !important;
  }
  .galaxy-bg {
    -webkit-mask-image: linear-gradient(to bottom, black 68%, transparent 100%) !important;
    mask-image: linear-gradient(to bottom, black 68%, transparent 100%) !important;
  }
  /* 水印遮挡：右下角小色块（与渐隐区同色） */
  .galaxy-wm-mask {
    position: absolute;
    right: 6px; bottom: 4px;
    width: 110px; height: 34px;
    background: linear-gradient(to top, #060a16 30%, rgba(6,10,22,0.9) 60%, transparent);
    z-index: 2;
    pointer-events: none;
    border-radius: 6px;
  }
  /* 底部衔接层：让界面区域与雪山渐隐平滑过渡 */
  .galaxy::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 120px;
    background: linear-gradient(to bottom, transparent, #060a16);
    z-index: 1;
    pointer-events: none;
  }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + fixCSS + '\n' + s.slice(styleEnd);
console.log('✅ 修复 CSS 已注入');

// 在 galaxy 容器内、背景图后插入水印遮罩
const bgImg = '<img class="galaxy-bg" src="snow_peaks_v6.png" alt="">';
if (s.includes(bgImg)) {
  s = s.replace(bgImg, bgImg + '\n<div class="galaxy-wm-mask"></div>');
  console.log('✅ 水印遮罩已插入');
} else {
  console.log('⚠️ 未找到背景图标签，跳过遮罩插入');
}

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存（水印+渐隐修复）');
