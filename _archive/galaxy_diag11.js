// 检查当前 dial 位置 + 核心下方可能显示的元素
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 1. 当前 dial 位置 CSS ===');
['dial-1','dial-2','dial-3','dial-4','dial-5','dial-6','dial-7'].forEach(c => {
  const idx = html.indexOf('.' + c + ' {');
  if (idx >= 0) {
    const line = html.slice(idx, idx + 80).split('\n')[0];
    console.log(c, '→', line.replace('.' + c + ' {', '').trim());
  }
});

console.log('\n=== 2. 核心内元素（可能被误认为圆盘） ===');
const coreIdx = html.indexOf('<div class="galaxy-core"');
console.log(html.slice(coreIdx, coreIdx + 800));

console.log('\n=== 3. 核心下方有没有绝对定位元素 ===');
// 找 galaxy 容器内、核心之后的其他元素
const gIdx = html.indexOf('<div class="galaxy">');
const gEnd = html.indexOf('</div>', html.indexOf('<!-- 中央核心 -->'));
console.log('galaxy 区域 HTML:');
console.log(html.slice(gIdx, gIdx + 2000));
