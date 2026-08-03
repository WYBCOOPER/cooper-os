// 分析 shell / chat-panel 闭合结构
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

const shellIdx = html.indexOf('<div class="shell">');
console.log('shell 开始:', shellIdx);

// 从 shell 开始做括号配平，找闭合
let depth = 0, i = shellIdx;
let lastDivEnd = -1;
while (i < html.length) {
  if (html.startsWith('<div', i)) depth++;
  if (html.startsWith('</div>', i)) {
    depth--;
    if (depth === 0) { lastDivEnd = i; break; }
  }
  i++;
}
console.log('shell 闭合位置:', lastDivEnd);
console.log('shell 内容长度:', lastDivEnd - shellIdx);
console.log('\n=== shell 闭合前后 300 字符 ===\n');
console.log(html.slice(lastDivEnd - 150, lastDivEnd + 200));

// chat-fab 和 chat-panel 的位置
console.log('\nchat-fab:', html.indexOf('chat-fab'));
console.log('chat-panel div:', html.indexOf('<div class="chat-panel"'));
console.log('script 开始:', html.indexOf('<script'));
