// 查看 server.js 的路由处理部分
const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

// 找处理请求的主函数
const lines = s.split('\n');
console.log('总行数:', lines.length);
console.log('\n=== 路由处理关键行 ===');
lines.forEach((l, i) => {
  const t = l.trim();
  if (t.includes('url ===') || t.includes('url.startsWith') || t.includes('url.endsWith') || t.includes('isAuthed') || t.includes('HTML_FILE')) {
    console.log(i + ': ' + t.slice(0, 100));
  }
});
