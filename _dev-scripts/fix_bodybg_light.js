// 修正：减轻 body 深色遮罩，让雪山真正透出全屏
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 找到 body 背景注入块，替换为轻遮罩
const oldBg = `/* ===== 关键：雪山铺满整个页面背景（body 级）===== */
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
  }`;

const newBg = `/* ===== 关键：雪山铺满整个页面背景（轻遮罩，雪山透出）===== */
  body {
    background:
      linear-gradient(to bottom, rgba(6,10,22,0.10) 0%, rgba(6,10,22,0.28) 55%, rgba(6,10,22,0.55) 100%),
      url('snow_peaks_v6.png') center top / cover no-repeat fixed !important;
    background-size: cover !important;
    background-attachment: fixed !important;
  }
  /* 内容容器：接近透明，雪山透出 */
  .shell {
    background: transparent !important;
  }
  /* 下方模块卡片：轻半透明，雪山透出 */
  .card, .module, .panel, section {
    background: rgba(14,22,44,0.38) !important;
    backdrop-filter: none !important;
  }
  /* 状态栏：轻渐变 */
  .statusbar {
    background: linear-gradient(to bottom, rgba(6,10,22,0.45), transparent) !important;
  }
  /* galaxy 场景：保留原雪山图（body 与 galaxy 图衔接） */
  .galaxy {
    background: transparent !important;
  }`;

if (s.includes(oldBg)) {
  s = s.replace(oldBg, newBg);
  console.log('✅ 遮罩减轻，雪山将透出');
} else {
  console.log('⚠️ 未找到原背景块，检查...');
  // 尝试部分替换
  const idx = s.indexOf('线性渐变至'); 
  console.log('找替代位置:', idx);
}

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
