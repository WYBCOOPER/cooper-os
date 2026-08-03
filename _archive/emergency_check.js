// 紧急检查：文件完整性 + 课程表功能
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';

if (!fs.existsSync(path)) {
  console.log('❌❌ index.html 不存在！');
  process.exit(1);
}

const html = fs.readFileSync(path, 'utf8');
console.log('文件大小:', (html.length / 1024).toFixed(1), 'KB');

// 1. 基本结构
console.log('\n=== 1. 基本结构 ===');
console.log('<html>', html.includes('<html'), '| <body>', html.includes('<body'), '| </body>', html.includes('</body>'), '| <script>', html.includes('<script'), '| </script>', html.includes('</script>'));

// 2. 课程表相关
console.log('\n=== 2. 课程表功能 ===');
['renderSchedule', 'cg_courses_v2', 'courses', '课程表', 'schedule'].forEach(k => {
  const c = (html.match(new RegExp(k, 'g')) || []).length;
  console.log(k, '→', c, '处', c > 0 ? '✅' : '❌ 缺失!');
});

// 3. 六大抽屉
console.log('\n=== 3. 抽屉 ===');
['d1','d2','d3','d4','d5','d6','d7'].forEach(d => {
  console.log('id="' + d + '"', html.includes('id="' + d + '"') ? '✅' : '❌ 缺失!');
});

// 4. 核心功能函数
console.log('\n=== 4. 核心函数 ===');
['renderSchedule', 'renderTodos', 'renderFocus', 'renderProjects', 'openDrawer', 'openModal', 'sendChat', 'openCapture', 'addSplit', 'renderTrack', 'renderDDL', 'saveReview'].forEach(f => {
  console.log(f, html.includes('function ' + f) ? '✅' : '❌ 缺失!');
});

// 5. 括号平衡
let bal = 0, bal2 = 0, neg = -1;
for (let i = 0; i < html.length; i++) {
  const ch = html[i];
  if (ch === '{') bal++;
  if (ch === '}') { bal--; if (bal < 0 && neg < 0) neg = i; }
  if (ch === '(') bal2++;
  if (ch === ')') bal2--;
}
console.log('\n=== 5. 括号 ===');
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal, '| 圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

// 6. JS 语法检查（提取全部 JS）
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allJs = '';
scripts.forEach(s => allJs += s.replace(/^<script>/, '').replace(/<\/script>$/, '') + '\n');
fs.writeFileSync('C:/Users/wyb/Desktop/草哥工作台/_emergency_check.js', allJs);
console.log('\nJS 块数:', scripts.length, '| JS 总长:', allJs.length);

// 7. 检查 store 键
console.log('\n=== 7. store 键 ===');
const keys = ['cg_courses_v2','cg_todos','cg_focus','cg_projects','cg_schedule','cg_track','cg_journal','cg_ddls','cg_splits','cg_apps','cg_clubs','cg_sleep','cg_water','cg_meds','cg_reviews'];
const missing = keys.filter(k => !html.includes(k));
console.log(missing.length === 0 ? '✅ 全部存在' : '❌ 缺失: ' + missing.join(', '));
