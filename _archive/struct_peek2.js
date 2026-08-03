// 查看 openDrawer 函数和抽屉显示逻辑
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 找 openDrawer 函数
const idx = html.indexOf('function openDrawer');
if (idx >= 0) {
  console.log('=== openDrawer 函数 ===\n');
  console.log(html.slice(idx, idx + 600));
}

// 找 .drawer 的 CSS
const cssIdx = html.indexOf('.drawer {');
if (cssIdx >= 0) {
  console.log('\n=== .drawer CSS ===\n');
  console.log(html.slice(cssIdx, cssIdx + 400));
}

// 看 shell 结束位置和 script 开头
const shellEnd = html.indexOf('</div>\n\n<script');
const scriptIdx = html.indexOf('<script');
console.log('\n=== shell 结束 → script 开头 ===\n');
console.log(html.slice(scriptIdx - 400, scriptIdx + 100));
