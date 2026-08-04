// 检查抽屉内部所有可能黑色的容器背景
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== 1. .drawer 背景是否生效（最终CSS顺序）===');
const drawerBg = s.lastIndexOf('抽屉面板背景：雪山氛围');
console.log('抽屉背景CSS位置:', drawerBg);
if (drawerBg > 0) {
  console.log(s.slice(drawerBg, drawerBg + 400).replace(/\s+/g, ' ').slice(0, 400));
}

console.log('\n=== 2. 抽屉内的主要子容器 ===');
// 找 .grid 和抽屉内模块容器
['.grid', '.drawer .card', '.module', '.panel', '.sec', '.drawer-title', '.tabs'].forEach(k => {
  const re = new RegExp('\\.' + k.replace('.', '').split(' ').join(' \\.') + '\\s*\\{[^}]*\\}', 'g');
  let m, count = 0;
  while ((m = re.exec(s)) !== null && count < 3) {
    const bg = m[0].match(/background[^;]*/g);
    if (bg) console.log(k + ': ' + bg.join(' | ').slice(0, 150));
    count++;
  }
});

console.log('\n=== 3. 找 .grid 样式 ===');
const gridIdx = s.indexOf('.grid {');
if (gridIdx > 0) console.log(s.slice(gridIdx, s.indexOf('}', gridIdx) + 1).replace(/\s+/g, ' ').slice(0, 300));

console.log('\n=== 4. 课程表/DDL 模块容器 ===');
['timetable', 'ddl-list', 'course', '.lesson'].forEach(k => {
  const re = new RegExp('\\.' + k + '\\s*\\{[^}]*\\}');
  const m = re.exec(s);
  if (m) {
    const bg = m[0].match(/background[^;]*/g);
    console.log('.' + k + ': ' + (bg ? bg.join(' | ') : '无背景设置') + ' | ' + m[0].replace(/\s+/g, ' ').slice(0, 120));
  }
});
