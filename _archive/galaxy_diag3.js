// 检查 body 背景 + 卫星背景颜色来源
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// body 样式
const bodyIdx = html.indexOf('body {');
if (bodyIdx >= 0) console.log('=== body 样式 ===\n' + html.slice(bodyIdx, bodyIdx + 500));

// 背景渐变/星云
const bgIdx = html.indexOf('background:');
const allBg = html.match(/body\s*\{[^}]*\}/);
console.log('\n=== body 背景相关 ===');
console.log(allBg ? allBg[0] : '未找到');

// 找 deep gradient / nebula
['nebula', 'radial-gradient', 'linear-gradient'].forEach(k => {
  const idx = html.indexOf(k);
  console.log(k, '→', idx >= 0 ? '位置 ' + idx : '❌');
});

// 卫星当前背景
const satBg = html.match(/\.sat \{[\s\S]*?\}/);
console.log('\n=== .sat 当前样式 ===\n' + (satBg ? satBg[0] : '未找到'));
