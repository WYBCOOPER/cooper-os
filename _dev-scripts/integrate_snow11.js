// 集成 v11 雪山风格到 index.html（只改视觉层，JS 逻辑不动）
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// ===== 1. 注入覆盖 CSS（在 </style> 前）=====
const overlayCSS = `
  /* ============================================
     v11 雪山版覆盖层（2026-08-04，只改视觉）
     背景：snow_peaks_v6.png 全屏铺底
     板块：7 个峰顶金色小圆钮（宝宝拖拽真实坐标）
     中央：月亮圆盘（时钟 + 今日聚焦）
     ============================================ */
  body {
    background: #060a16 !important;
  }

  /* galaxy 容器：改成图片比例的全屏场景 */
  .galaxy {
    position: relative !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 auto !important;
    aspect-ratio: 16 / 9 !important;
    display: block !important;
  }
  .galaxy-bg {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; z-index: 0;
    border-radius: 18px;
  }
  .galaxy > svg { display: none !important; }

  /* 峰顶按钮：小圆钮（原大圆盘覆盖掉） */
  .dial {
    width: clamp(38px, 4.2vw, 48px) !important;
    height: clamp(38px, 4.2vw, 48px) !important;
    background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.72), rgba(232,201,143,0.52) 50%, rgba(232,201,143,0.15) 100%) !important;
    border: 1.5px solid rgba(255,255,255,0.62) !important;
    box-shadow: 0 0 14px rgba(232,201,143,0.42), 0 3px 10px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.5) !important;
    backdrop-filter: none !important;
    gap: 0 !important;
    animation: none !important;
    padding: 0 !important;
    transform: translate(-50%, -50%) !important;
  }
  .dial .d-ic { font-size: clamp(15px, 1.7vw, 20px) !important; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.45)); }
  .dial .d-num { display: none !important; }
  .dial .d-label {
    position: absolute; top: 122%; left: 50%;
    transform: translateX(-50%);
    font-size: clamp(10px, 1.1vw, 13px); font-weight: 600; letter-spacing: .1em;
    color: #fff; text-shadow: 0 1px 8px rgba(0,0,0,0.95), 0 0 16px rgba(0,0,0,0.7);
    white-space: nowrap; opacity: 0; transition: opacity .25s;
    pointer-events: none;
    background: rgba(0,0,0,0.4); padding: 2px 9px; border-radius: 100px;
  }
  .dial:hover { transform: translate(-50%, -50%) scale(1.18) !important; box-shadow: 0 0 28px rgba(232,201,143,0.75), 0 6px 16px rgba(0,0,0,0.5) !important; }
  .dial:hover .d-label { opacity: 1 !important; }
  .dial.active { transform: translate(-50%, -50%) scale(1.12) !important; }

  /* 7 个板块峰顶坐标（宝宝拖拽真实坐标） */
  /* 学业 d1 → 40.8, 58.9 */
  .dial-1 { left: 40.8% !important; top: 58.9% !important; right: auto !important; bottom: auto !important; }
  /* 工作 d2 → 60.6, 40.5（主峰最高） */
  .dial-2 { left: 60.6% !important; top: 40.5% !important; right: auto !important; bottom: auto !important; }
  /* 对话 d7 → 75.8, 55.4 */
  .dial-3 { left: 75.8% !important; top: 55.4% !important; right: auto !important; bottom: auto !important; }
  /* 工具 d5 → 30.3, 48.8 */
  .dial-4 { left: 30.3% !important; top: 48.8% !important; right: auto !important; bottom: auto !important; }
  /* 生活 d3 → 40.2, 46 */
  .dial-5 { left: 40.2% !important; top: 46% !important; right: auto !important; bottom: auto !important; }
  /* 知识库 d4 → 88.2, 52 */
  .dial-6 { left: 88.2% !important; top: 52% !important; right: auto !important; bottom: auto !important; }
  /* 日记 d6 → 8, 51.9 */
  .dial-7 { left: 8% !important; top: 51.9% !important; right: auto !important; bottom: auto !important; }

  /* 中央核心：月亮圆盘（居中于天空） */
  .galaxy-core {
    position: absolute !important;
    left: 50% !important; top: 21% !important;
    transform: translate(-50%, -50%) !important;
    width: clamp(150px, 18vw, 240px) !important;
    height: clamp(150px, 18vw, 240px) !important;
    border-radius: 50% !important;
    background:
      radial-gradient(circle at 32% 26%, rgba(255,255,255,0.22), rgba(255,255,255,0.05) 40%, transparent 58%),
      radial-gradient(circle at 50% 50%, rgba(24,34,56,0.66), rgba(10,14,26,0.72)) !important;
    border: 1px solid rgba(255,255,255,0.34) !important;
    box-shadow:
      inset 6px 6px 20px rgba(255,255,255,0.06),
      inset -8px -8px 24px rgba(0,0,0,0.34),
      0 0 70px rgba(232,201,143,0.14),
      0 14px 46px rgba(0,0,0,0.42) !important;
    animation: none !important;
    z-index: 7 !important;
    overflow: hidden !important;
  }
  .galaxy-core:hover { transform: translate(-50%, -50%) scale(1.03) !important; }

  @media (max-width: 760px) {
    .galaxy { aspect-ratio: 16 / 11 !important; }
    .dial { width: 40px !important; height: 40px !important; }
    .dial .d-label { font-size: 9px !important; }
    .galaxy-core { width: 140px !important; height: 140px !important; }
  }
`;

const styleEnd = s.lastIndexOf('</style>');
if (styleEnd < 0) { console.error('❌ 未找到 </style>'); process.exit(1); }
s = s.slice(0, styleEnd) + overlayCSS + '\n' + s.slice(styleEnd);
console.log('✅ 覆盖 CSS 已注入');

// ===== 2. galaxy 容器内插入背景图 =====
const galaxyStart = s.indexOf('<div class="galaxy">');
if (galaxyStart < 0) { console.error('❌ 未找到 galaxy 容器'); process.exit(1); }
const insertAt = galaxyStart + '<div class="galaxy">'.length;
s = s.slice(0, insertAt) + '\n<img class="galaxy-bg" src="snow_peaks_v6.png" alt="">' + s.slice(insertAt);
console.log('✅ 背景图已插入 galaxy 容器');

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存（v11 雪山版）');
