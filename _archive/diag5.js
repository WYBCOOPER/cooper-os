// 分析 COOPER OS index.html 结构
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const html = fs.readFileSync(path, 'utf8');

// 找到 :root 块
const rootMatch = html.match(/:root\s*\{[^}]*\}/);
console.log('=== :root 块 ===');
console.log(rootMatch ? rootMatch[0].slice(0, 600) : '未找到');

// 找卡片样式
const cardMatch = html.match(/\.card\s*\{[^}]*\}/);
console.log('\n=== .card 样式 ===');
console.log(cardMatch ? cardMatch[0].slice(0, 400) : '未找到');

// 找状态栏
const sbMatch = html.match(/\.statusbar\s*\{[^}]*\}/);
console.log('\n=== .statusbar ===');
console.log(sbMatch ? sbMatch[0].slice(0, 300) : '未找到');

// 找 grid 主容器
const gridMatch = html.match(/\.grid\s*\{[^}]*\}/);
console.log('\n=== .grid ===');
console.log(gridMatch ? gridMatch[0] : '未找到');

// 手机端 media query
const mqMatch = html.match(/@media \(max-width: 760px\)\s*\{[\s\S]*?\n  \}/);
console.log('\n=== @media 760px（前 500 字符）===');
console.log(mqMatch ? mqMatch[0].slice(0, 500) : '未找到');

// 文件统计
console.log('\n=== 统计 ===');
console.log('总长度:', html.length);
console.log('卡片数量(emoji标题):', (html.match(/<div class="card/g) || []).length);
