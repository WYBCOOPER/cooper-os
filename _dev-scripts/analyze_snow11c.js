// 分析 index.html：板块容器 + 星系总控台 + 背景
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== 1. dial-num-1 附近 HTML（板块按钮）===');
let i = s.indexOf('dial-num-1');
console.log(s.slice(i - 600, i + 200).replace(/\s+/g, ' ').slice(0, 800));

console.log('\n=== 2. galaxy-core 附近 HTML ===');
i = s.indexOf('galaxy-core');
console.log(s.slice(i - 200, i + 900).replace(/\s+/g, ' ').slice(0, 1100));

console.log('\n=== 3. body 标签附近（背景）===');
i = s.indexOf('<body');
console.log(s.slice(i, i + 700).replace(/\s+/g, ' ').slice(0, 700));
