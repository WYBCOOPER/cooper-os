// 将新设计系统注入 index.html + 改造抽屉按钮
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const cssPath = 'C:/Users/wyb/Desktop/草哥工作台/new_design.css';
let html = fs.readFileSync(path, 'utf8');
const newCss = fs.readFileSync(cssPath, 'utf8');

// 1. 替换 <style>...</style> 内容
const styleMatch = html.match(/<style>[\s\S]*?<\/style>/);
if (!styleMatch) { console.log('❌ <style> 未找到'); process.exit(1); }
html = html.replace(styleMatch[0], '<style>' + newCss + '</style>');
console.log('✅ CSS 已替换（新设计系统注入）');

// 2. 改造抽屉按钮：📚 学业 → <span class="t-emoji">📚</span><span>学业</span>
// 匹配 drawer-btn 的按钮
const btnRegex = /(<button class="drawer-btn[^"]*"[^>]*>)([\s\S]*?)(<\/button>)/g;
let btnCount = 0;
html = html.replace(btnRegex, (whole, open, content, close) => {
  // 提取第一个 emoji 和剩余文字
  const emojiMatch = content.match(/^(\s*)([\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F])([\s\S]*)$/u);
  if (emojiMatch) {
    const emoji = emojiMatch[2];
    const rest = emojiMatch[3].trim();
    btnCount++;
    return `${open}<span class="t-emoji">${emoji}</span><span>${rest}</span>${close}`;
  }
  return whole;
});
console.log('✅ 抽屉按钮已改造:', btnCount, '个');

// 3. 桌面端按钮文字也要正常显示（加个样式让桌面端横排）
// 在 CSS 末尾追加桌面端适配（t-emoji 内联）
const desktopFix = `
  /* 桌面端按钮：图标文字横排 */
  @media (min-width: 761px) {
    .drawer-btn { display: inline-flex; align-items: center; gap: 6px; }
    .drawer-btn .t-emoji { font-size: 14px; }
  }
`;
html = html.replace('</style>', desktopFix + '</style>');
console.log('✅ 桌面端适配已加');

fs.writeFileSync(path, html);
console.log('✅ 写入完成，新文件大小:', (html.length / 1024).toFixed(1), 'KB');
