// 定位 server.js 第 100 行的原始内容
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');
console.log('总行数:', lines.length);
console.log('=== 第 98-102 行 ===');
for (let i = 97; i < Math.min(102, lines.length); i++) {
  console.log((i + 1) + ': [' + lines[i] + ']');
}
console.log('\n=== 字节级检查（找非法字符）===');
const line = lines[99] || '';
for (let i = 0; i < line.length; i++) {
  const code = line.charCodeAt(i);
  if (code === 0xFFFD || (code > 0xE000 && code < 0xF900) || code === 0x3F) {
    console.log('位置', i, '字符码', code.toString(16), '字符:', line[i]);
  }
}
