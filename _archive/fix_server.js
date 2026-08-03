// 修复 server.js 乱码
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
let s = fs.readFileSync(path, 'utf8');

// 1. 修复乱码注释（GBK 误读的 UTF-8）
// 原文应该是：/* 文档占位 */
s = s.replace(/\/\* \u9519[\s\S]*?\*\//g, '/* 文档占位 */');

// 2. 修复乱码 msg 字符串（整行替换）
s = s.replace(/res\.end\(JSON\.stringify\(\{ ok: true, msg: '[^']*' \}\)\);/,
  "res.end(JSON.stringify({ ok: true, msg: '文档中心：请将文件放入本目录 docs/ 文件夹' }));");

// 3. 检查是否还有其他乱码
const mojibake = s.match(/[\uFFFD\u9519\u65B9\u7A0B\u7EC4\u8868\u5934\u5F3A]/g);
console.log('剩余疑似乱码字符数:', mojibake ? mojibake.length : 0);

fs.writeFileSync(path, s);
console.log('✅ server.js 已修复');

// 4. 语法验证
try {
  new Function(s);
  console.log('✅ 语法正确');
} catch (e) {
  console.log('❌ 仍有语法错误:', e.message);
}
