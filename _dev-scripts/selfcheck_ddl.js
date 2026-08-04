// 自检：DDL 展示 + 今日聚焦添加入口 + 板块功能
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== 1. DDL 展示位置 ===');
// DDL 在主界面哪里展示？
['core-ddl', 'deck-ddl', 'ddl-list', 'renderDDL', 'loadDDL'].forEach(k => {
  const c = (s.match(new RegExp(k, 'g')) || []).length;
  console.log(k + ': ' + c + ' 次');
});

console.log('\n=== 2. 今日聚焦添加入口 ===');
['addFocus', 'core-add', 'deck-add', '今日聚焦'].forEach(k => {
  const c = (s.match(new RegExp(k, 'g')) || []).length;
  console.log(k + ': ' + c + ' 次');
});

console.log('\n=== 3. addFocus 函数定义 ===');
const af = s.indexOf('function addFocus');
if (af >= 0) console.log(s.slice(af, af + 500).replace(/\s+/g, ' '));
else console.log('❌ addFocus 未找到');

console.log('\n=== 4. 主界面(非圆盘)的 DDL/聚焦模块 ===');
// 找 d1 抽屉里的内容
const d1 = s.indexOf('id="d1"');
if (d1 >= 0) console.log('d1 抽屉存在 @ ' + d1);
const d4 = s.indexOf('id="d4"');
if (d4 >= 0) console.log('d4 抽屉存在 @ ' + d4);
