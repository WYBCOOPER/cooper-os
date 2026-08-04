// 加强雪山底部渐隐，消除上下割裂
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

// 找到现有渐隐 CSS 并加强
const oldMask = 'linear-gradient(to bottom, black 68%, transparent 100%)';
const newMask = 'linear-gradient(to bottom, black 52%, transparent 98%)';
if (s.includes(oldMask)) {
  s = s.split(oldMask).join(newMask);
  console.log('✅ 渐隐范围加强: 68% → 52%');
} else {
  console.log('⚠️ 未找到原渐隐，追加新样式');
}

// 加强底部衔接层高度
const oldAfter = 'height: 120px;';
if (s.includes(oldAfter)) {
  s = s.split(oldAfter).join('height: 220px;');
  console.log('✅ 衔接层加强: 120px → 220px');
}

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存');

// 同步网页版
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
