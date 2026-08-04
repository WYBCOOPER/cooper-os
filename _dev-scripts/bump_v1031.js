// 更新 index.html 版本号 10.3.0 → 10.3.1
const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
const before = s.includes("version: '10.3.0'");
s = s.split("version: '10.3.0'").join("version: '10.3.1'");
fs.writeFileSync('index.html', s);
fs.copyFileSync('index.html', '草哥工作台.html');
console.log('✅ 替换前存在: ' + before + ' → 已更新为 10.3.1，网页版已同步');
