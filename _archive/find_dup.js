// 彻底清理：找出重复的星系 HTML 块
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. 统计所有星系相关元素出现次数
console.log('=== 星系元素出现次数 ===');
['<div class="galaxy">', 'galaxy-core', 'class="orbit', 'core-ring', 'class="dial dial-', 'class="sat sat-'].forEach(k => {
  const n = (html.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(k, '→', n);
});

// 2. 找所有 galaxy 容器位置
console.log('\n=== galaxy 容器位置 ===');
let idx = 0;
while ((idx = html.indexOf('<div class="galaxy">', idx)) >= 0) {
  console.log('@' + idx);
  idx += 10;
}

// 3. 找 galaxy-core 位置
console.log('\n=== galaxy-core 位置 ===');
idx = 0;
while ((idx = html.indexOf('class="galaxy-core"', idx)) >= 0) {
  console.log('@' + idx);
  idx += 20;
}

// 4. 看两个 galaxy 容器之间的内容（可能一个是旧的一个是新的）
const g1 = html.indexOf('<div class="galaxy">');
const g2 = html.indexOf('<div class="galaxy">', g1 + 10);
if (g1 >= 0 && g2 >= 0) {
  console.log('\n=== 第一个 galaxy 容器内容（前 600 字符）===');
  console.log(html.slice(g1, g1 + 600));
  console.log('\n=== 两个 galaxy 之间的间隔:', g2 - g1, '字符 ===');
}
