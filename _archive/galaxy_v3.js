// galaxy_v3 修复：插入隐藏原始指挥台（保留原 ID 供 JS 写入）+ 调整同步脚本
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 从备份提取原始 command-deck HTML
const bak = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index_v1026_backup2.html', 'utf8');
const deckStart = bak.indexOf('<div class="command-deck">');
let depth = 0, i = deckStart, deckEnd = -1;
while (i < bak.length) {
  if (bak.startsWith('<div', i)) depth++;
  if (bak.startsWith('</div>', i)) {
    depth--;
    if (depth === 0) { deckEnd = i + 6; break; }
  }
  i++;
}
const originalDeck = bak.slice(deckStart, deckEnd);
console.log('原始 command-deck 长度:', originalDeck.length);

// 把原始 command-deck 改为隐藏版（保留所有 ID，JS 可以写入，视觉隐藏）
const hiddenDeck = originalDeck.replace('<div class="command-deck">', '<div class="command-deck" style="display:none!important">');
console.log('隐藏版生成，含 deck-time:', hiddenDeck.includes('deck-time'), '| deck-focus:', hiddenDeck.includes('deck-focus'));

// 在星系外壳前插入隐藏指挥台
const galaxyIdx = html.indexOf('<!-- ===== 星系总控台（黑金）=====');
if (galaxyIdx < 0) { console.log('❌ 找不到星系注释'); process.exit(1); }
html = html.slice(0, galaxyIdx) + '<!-- 隐藏原始指挥台（保留 ID 供 JS 写入）-->\n' + hiddenDeck + '\n' + html.slice(galaxyIdx);
console.log('✅ 隐藏指挥台已插入');

// 修复同步脚本：现在 deck-time 存在（隐藏版），同步逻辑本来就对；但 deck-focus 内容也在隐藏版里
// 检查天气同步：weather-widget 在隐藏版里，OK

// 验证关键 ID 存在性
['deck-time', 'deck-date', 'weather-widget', 'deck-focus', 'deck-ddl', 'deck-next'].forEach(id => {
  // 只统计元素定义（id="...")
  const re = new RegExp('id="' + id + '"');
  console.log(id, re.test(html) ? '✅ 存在' : '❌ 缺失');
});

fs.writeFileSync(path, html);
console.log('\n✅ v3 修复完成！大小:', (html.length / 1024).toFixed(1), 'KB');
