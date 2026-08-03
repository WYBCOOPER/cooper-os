// 确认扫描结果：是不是误报
const fs = require('fs');

// 1. 看 index.html 匹配的具体内容
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');
// 找长字符串（可能是 API key 模式匹配到的）
const longMatches = html.match(/[A-Za-z0-9]{25,}/g) || [];
console.log('=== index.html 长字符串（25+字符）===');
longMatches.slice(0, 20).forEach(m => {
  // 排除明显是版本号/哈希的
  console.log(' ', m.slice(0, 50), m.length + '字符');
});

// 2. 检查 .npmrc 内容
console.log('\n=== .npmrc 内容 ===');
try {
  const npmrc = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/.npmrc', 'utf8');
  console.log(npmrc);
} catch(e) { console.log('读取失败:', e.message); }
