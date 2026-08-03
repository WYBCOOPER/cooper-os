// 回归测试 v2：修正 modal 匹配（按实际格式）
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('========== COOPER OS 回归测试 v2 ==========\n');
let pass = 0, fail = 0;

function check(name, cond) {
  if (cond) { console.log('✅', name); pass++; }
  else { console.log('❌', name); fail++; }
}

// === 1. 弹窗卡死 bug（modal 默认隐藏）——按实际格式匹配 ===
const modalBlock = html.match(/\.modal-overlay\s*\{[^}]*\}/);
check('modal-overlay 默认隐藏（display:none 在）', modalBlock && modalBlock[0].includes('display: none'));
check('modal.open 才显示', html.includes('.modal-overlay.open { display: flex'));

// === 2. 大圆球残留 bug ===
check('只有一个星系容器', (html.match(/<div class="galaxy">/g) || []).length === 1);
check('无旧版 orbit 轨道残留', !html.includes('<div class="orbit orbit-1">'));
check('无 core-ring 残留', !html.includes('class="core-ring ring-outer"'));

// === 3. 点击跳动 bug ===
check('dial-4 hover 保留 translateX', html.includes('.dial-4:hover { transform: translateX(-50%) scale(1.05); }'));
check('dial-4 active 保留 translateX', html.includes('.dial-4.active { transform: translateX(-50%); }'));

// === 4. 课程表 ===
check('renderSchedule 存在', html.includes('function renderSchedule'));
check('cg_courses_v2 存在', html.includes('cg_courses_v2'));

// === 5. 弹窗禁用 ===
check('maybeShowReview 已禁用', html.includes('function maybeShowReview() { return;'));
check('夜间复盘自动弹窗已禁用', !html.includes("review-modal').classList.add('open')") || html.includes('已禁用夜间复盘'));

// === 6. 聚焦交互 ===
check('核心聚焦可完成', html.includes('onclick="toggleFocus('));
check('核心聚焦可删除', html.includes('delFocus('));
check('✕ 删除按钮样式', html.includes('.fc-x'));

// === 7. 顶栏遮挡 ===
check('星系顶部留空间', html.includes('margin: 56px auto 30px;'));
check('工具小球不在 -14%', !html.includes('.dial-4 { top: -14%;'));

// === 8. 7 板块 ===
check('7 个板块小球', (html.match(/class="dial dial-\d"/g) || []).length === 7);

// === 9. 同步 ===
check('时钟同步', html.includes('deck-time2') && html.includes("getElementById('deck-time')"));
check('DDL 同步', html.includes('syncDDL'));
check('天气同步', html.includes('syncWeather'));

// === 10. 配色 ===
check('黑金配色', html.includes('#d4af6a'));
check('无蓝色 --accent', !html.includes('--accent: #4f8dff'));

// === 11. 结构 ===
check('<html> 存在', html.includes('<html'));
check('</body> 存在', html.includes('</body>'));
check('抽屉 d1-d7 完整', ['d1','d2','d3','d4','d5','d6','d7'].every(d => html.includes('id="' + d + '"')));

// === 12. JS 语法（提取后 node --check 由外部执行） ===
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allJs = '';
scripts.forEach(s => allJs += s.replace(/^<script>/, '').replace(/<\/script>$/, '') + '\n');
fs.writeFileSync('C:/Users/wyb/Desktop/草哥工作台/_regress_check.js', allJs);
check('JS 提取成功', allJs.length > 90000);

console.log('\n========== 结果: ' + pass + ' 通过 / ' + fail + ' 失败 ==========');
