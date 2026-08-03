// 检查卫星图标 + 核心边框
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 卫星图标 ===');
const m = html.match(/<span class="s-ic">([^<]+)<\/span>/g) || [];
m.forEach(x => console.log(' ', x.replace('<span class="s-ic">', '').replace('</span>', '')));

console.log('\n=== 核心 HTML ===');
const cIdx = html.indexOf('<div class="galaxy-core"');
console.log(html.slice(cIdx, cIdx + 500));
