// 抽屉背景：明显深蓝夜空 + 星光（不再接近黑色）
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 找到老师之前注入的抽屉背景块，整体替换
const oldStart = s.indexOf('/* ===== 抽屉面板背景：雪山氛围（不再是漆黑一片）===== */');
const oldEnd = s.indexOf('/* ===== 毛玻璃清理');
if (oldStart > 0 && oldEnd > oldStart) {
  const newCSS = `/* ===== 抽屉面板背景：深蓝夜空 + 星光（明显的雪山氛围）===== */
  .drawer {
    background:
      radial-gradient(ellipse at 50% 0%, rgba(70,105,170,0.30), transparent 60%),
      radial-gradient(ellipse at 20% 85%, rgba(232,201,143,0.10), transparent 40%),
      radial-gradient(ellipse at 85% 70%, rgba(232,201,143,0.07), transparent 35%),
      linear-gradient(to bottom, rgba(20,32,62,0.94), rgba(12,18,38,0.97)) !important;
    border-radius: 20px !important;
    border: 1px solid rgba(160,190,240,0.18) !important;
    padding: 22px !important;
    margin-top: 18px !important;
    box-shadow: 0 18px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  }
  /* 卡片：深蓝半透明，跟雪山统一（不再纯黑） */
  .drawer .card {
    background: rgba(24,38,72,0.65) !important;
    border: 1px solid rgba(160,190,240,0.14) !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
  }
  /* 标题：金色点缀（跟月亮标签一致） */
  .drawer .drawer-title, .drawer h2, .drawer h3, .drawer .card h3, .drawer .card h4 {
    color: #e8c98f !important;
  }
  /* 输入框：深蓝底 */
  .drawer input, .drawer textarea, .drawer select {
    background: rgba(10,16,34,0.8) !important;
    border-color: rgba(160,190,240,0.2) !important;
    color: #fff !important;
  }
  /* 次要文字提亮 */
  .drawer .text-dim, .drawer .muted, .drawer .sub, .drawer .hint {
    color: rgba(200,215,245,0.75) !important;
  }
  /* 滚动条样式 */
  .drawer ::-webkit-scrollbar { width: 8px; }
  .drawer ::-webkit-scrollbar-thumb { background: rgba(160,190,240,0.3); border-radius: 4px; }
`;
  s = s.slice(0, oldStart) + newCSS + s.slice(oldEnd);
  console.log('✅ 抽屉背景已替换为深蓝夜空+星光');
} else {
  console.log('❌ 未找到旧抽屉背景块 (start=' + oldStart + ', end=' + oldEnd + ')');
}

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
