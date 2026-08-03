// 回归测试：检查所有历史 bug 是否复发
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('========== COOPER OS 回归测试 ==========\n');
let pass = 0, fail = 0;

function check(name, cond) {
  if (cond) { console.log('✅', name); pass++; }
  else { console.log('❌', name); fail++; }
}

// === 1. 弹窗卡死 bug（modal 默认隐藏） ===
check('modal-overlay 默认隐藏（不卡屏）', html.includes('.modal-overlay {\n    position: fixed; inset: 0; z-index: 500;\n    background: rgba(3,4,8,0.7); backdrop-filter: blur(8px);\n    display: none;'));
check('modal.open 才显示', html.includes('.modal-overlay.open { display: flex; }'));

// === 2. 大圆球残留 bug（两套星系重叠） ===
const galaxyCount = (html.match(/<div class="galaxy">/g) || []).length;
check('只有一个星系容器（无重复大圆球）', galaxyCount === 1);
check('无旧版 orbit 轨道残留', !html.includes('<div class="orbit orbit-1">'));
check('无 core-ring 装饰环残留', !html.includes('class="core-ring ring-outer"'));

// === 3. 点击跳动 bug（transform 冲突） ===
check('dial-4 hover 保留 translateX（不跳动）', html.includes('.dial-4:hover { transform: translateX(-50%) scale(1.05); }'));
check('dial-4 active 保留 translateX', html.includes('.dial-4.active { transform: translateX(-50%); }'));

// === 4. 课程表功能 ===
check('renderSchedule 函数存在', html.includes('function renderSchedule'));
check('cg_courses_v2 store 键存在', html.includes('cg_courses_v2'));

// === 5. 弹窗自动触发已禁用 ===
check('maybeShowReview 已禁用（不自动弹周回顾）', html.includes('function maybeShowReview() { return;'));
check('夜间复盘自动弹窗已禁用', html.includes('已禁用夜间复盘自动弹窗') || !html.includes("review-modal').classList.add('open')"));

// === 6. 聚焦交互（本次新修） ===
check('核心聚焦可点击完成（toggleFocus）', html.includes('onclick="toggleFocus('));
check('核心聚焦可删除（delFocus）', html.includes('onclick="event.stopPropagation();delFocus('));
check('聚焦删除按钮样式', html.includes('.fc-x'));

// === 7. 顶栏遮挡（本次新修） ===
check('星系顶部留出空间（避开顶栏）', html.includes('margin: 56px auto 30px;'));
check('工具小球不再用 -14%（超出容器）', !html.includes('.dial-4 { top: -14%;'));

// === 8. 7 个板块完整 ===
const dialCount = (html.match(/class="dial dial-\d"/g) || []).length;
check('7 个板块小球完整', dialCount === 7);

// === 9. 核心同步（时钟/天气/DDL/聚焦） ===
check('时钟同步', html.includes('deck-time2') && html.includes("getElementById('deck-time')"));
check('DDL 同步', html.includes('syncDDL'));
check('天气同步', html.includes('syncWeather'));

// === 10. 黑金配色 ===
check('黑金配色（金色 accent）', html.includes('#d4af6a'));
check('无蓝色残留（--accent 不是蓝）', !html.includes('--accent: #4f8dff'));

// === 11. 结构完整性 ===
check('<html> 存在', html.includes('<html'));
check('</body> 存在', html.includes('</body>'));
check('抽屉 d1-d7 完整', ['d1','d2','d3','d4','d5','d6','d7'].every(d => html.includes('id="' + d + '"')));

console.log('\n========== 回归结果: ' + pass + ' 通过 / ' + fail + ' 失败 ==========');
