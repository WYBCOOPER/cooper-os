// 修复：恢复 DDL/聚焦添加/天气，圆盘加大，紧凑排版
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 1. 修改圆盘精简 CSS：把 display:none 改回，加大圆盘
const oldClean = `
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

const newClean = `
  /* ===== 月亮圆盘：加大 + 恢复全部功能（DDL/聚焦添加/天气）===== */
  .galaxy-core {
    gap: 2px !important;
    padding: 12px 14px !important;
    width: clamp(190px, 21vw, 290px) !important;
    height: clamp(190px, 21vw, 290px) !important;
  }
  /* 时钟 */
  .core-time {
    font-size: clamp(28px, 3.4vw, 42px) !important;
    color: #f5e6c4 !important;
    text-shadow: 0 0 40px rgba(232,201,143,0.7), 0 2px 8px rgba(0,0,0,0.5) !important;
    line-height: 1 !important;
  }
  .core-date {
    font-size: clamp(8px, 1vw, 11px) !important;
    color: rgba(255,255,255,0.85) !important;
    letter-spacing: .2em !important;
    margin-top: 4px !important;
  }
  .core-label {
    font-size: clamp(7px, .85vw, 9px) !important;
    color: #e8c98f !important;
    letter-spacing: .28em !important;
    margin-top: 5px !important;
  }
  /* 聚焦：一行小胶囊 */
  .core-focus {
    margin-top: 5px !important;
    font-size: clamp(8px, .95vw, 10px) !important;
    max-width: 94% !important;
  }
  .core-focus .focus-item, .core-focus .deck-focus-item {
    font-size: clamp(8px, .95vw, 10px) !important;
    padding: 2px 9px !important;
  }
  /* 恢复天气（单行小字） */
  .core-weather {
    font-size: clamp(7px, .8vw, 9px) !important;
    margin-top: 4px !important;
    max-width: 92% !important;
  }
  /* 恢复 ＋今日聚焦（小按钮） */
  .core-add {
    font-size: clamp(8px, .9vw, 10px) !important;
    margin-top: 4px !important;
    padding: 2px 10px !important;
    border: 1px solid rgba(232,201,143,0.4) !important;
    border-radius: 100px !important;
    background: rgba(232,201,143,0.08) !important;
  }
  /* 恢复 DDL（一行小字） */
  .core-ddl {
    font-size: clamp(7px, .8vw, 9px) !important;
    margin-top: 3px !important;
    max-width: 94% !important;
  }
  .core-ddl .ddl-item {
    font-size: clamp(7px, .8vw, 9px) !important;
    padding: 2px 8px !important;
  }
`;

if (s.includes(oldClean)) {
  s = s.replace(oldClean, newClean);
  console.log('✅ 圆盘修复：恢复全部功能 + 加大');
} else {
  console.log('⚠️ 未找到原精简 CSS（可能已被改）');
  // 直接定位并修改 display:none 部分
  const hides = ['.core-weather { display: none !important; }', '.core-add { display: none !important; }', '.core-ddl { display: none !important; }'];
  hides.forEach(h => {
    if (s.includes(h)) { s = s.replace(h, h.replace('display: none', 'display: flex')); console.log('✅ 恢复 ' + h.slice(0, 30)); }
  });
}

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
