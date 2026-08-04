// 提取 galaxy 总控台完整 HTML 结构
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== 1. dial-1 到 dial-7 完整 HTML ===');
const d1 = s.indexOf('dial dial-1');
const d7end = s.indexOf('</div>', s.indexOf('dial-7'));
// 向后找到板块容器结束
const dialBlockEnd = s.indexOf('dial-board', d1);
console.log('dial 区域: ' + d1 + ' ~ ' + dialBlockEnd);
console.log(s.slice(d1 - 50, Math.min(s.length, d1 + 2600)).replace(/\s+/g, ' '));

console.log('\n=== 2. 找 dial 按钮 CSS ===');
const cssI = s.indexOf('.dial {');
console.log(s.slice(cssI - 200, cssI + 900));
