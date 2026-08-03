// 查看 index.html 结构概览
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

const patterns = ['<body', 'statusbar', 'drawer-nav', 'drawer-panel', 'id="d1"', 'id="d2"', 'id="d3"', 'id="d4"', 'id="d5"', 'id="d6"', 'id="d7"', 'chat-fab', 'chat-panel', '<script', '</body>'];
console.log('总长度:', html.length);
patterns.forEach(p => {
  const idx = html.indexOf(p);
  console.log(p, '→', idx >= 0 ? '位置 ' + idx : '❌ 未找到');
});

// 打印 body 开头 2500 字符看结构
const bodyIdx = html.indexOf('<body');
console.log('\n=== body 开头结构 ===\n');
console.log(html.slice(bodyIdx, bodyIdx + 2500));
