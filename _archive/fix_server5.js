// 修复 server.js 的 HTML_FILE 路径乱码
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
let s = fs.readFileSync(path, 'utf8');

// 找到 HTML_FILE 定义行并替换
const m = s.match(/const HTML_FILE = path\.join\(__dirname, '[^']*'\);/);
if (m) {
  console.log('原始:', m[0]);
  s = s.replace(m[0], "const HTML_FILE = path.join(__dirname, 'index.html');");
  console.log('✅ 已替换为 index.html（开发版）');
} else {
  console.log('❌ 未找到 HTML_FILE 定义');
  // 兜底：直接正则替换乱码文件名
  s = s.replace(/鑽夊摜宸ヤ綔鍙[^'"]*/, 'index.html');
  console.log('✅ 兜底替换完成');
}

fs.writeFileSync(path, s);
console.log('写入完成');

// 语法验证
try { new Function(s); console.log('✅ 语法正确'); } catch (e) { console.log('❌ 语法错误:', e.message); }
