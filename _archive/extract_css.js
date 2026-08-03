// 提取完整 CSS 供重构参考
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const html = fs.readFileSync(path, 'utf8');
const m = html.match(/<style>([\s\S]*?)<\/style>/);
if (!m) { console.log('❌ style 未找到'); process.exit(1); }
fs.writeFileSync('C:/Users/wyb/Desktop/草哥工作台/css_old_full.txt', m[1]);
console.log('✅ 已提取完整 CSS:', m[1].length, '字符');
// 输出到控制台分段查看
const css = m[1];
console.log('\n=== 前 3000 字符 ===');
console.log(css.slice(0, 3000));
