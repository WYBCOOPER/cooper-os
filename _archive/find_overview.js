// 查找"今日概览"元素来源
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 搜索"今日概览"
let idx = 0;
const found = [];
while ((idx = html.indexOf('今日概览', idx)) >= 0) {
  found.push(idx);
  idx += 4;
}
console.log('「今日概览」出现位置:', found.length, found);

found.forEach(pos => {
  console.log('\n=== 上下文 @' + pos + ' ===');
  console.log(html.slice(pos - 300, pos + 300));
});
