// 查看核心聚焦区域当前结构 + 原 deck-focus 渲染样式
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 核心内的聚焦容器
const f2Idx = html.indexOf('core-focus');
console.log('=== 核心聚焦区域 HTML ===');
console.log(html.slice(f2Idx - 300, f2Idx + 200));

// 原 deck-focus-item 样式（决定每条聚焦的高度）
const itemIdx = html.indexOf('.deck-focus-item');
console.log('\n=== 原聚焦条目样式 ===');
console.log(html.slice(itemIdx, itemIdx + 700));
