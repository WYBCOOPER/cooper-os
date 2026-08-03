// 星系界面关键逻辑验证
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 星系界面逻辑检查 ===\n');

// 1. 核心时钟同步
const syncOk = html.includes('deck-time2') && html.includes('getElementById(\'deck-time\')');
console.log(syncOk ? '✅ 核心时钟同步脚本' : '❌ 时钟同步缺失');

// 2. 隐藏指挥台（原 JS 写入目标保留）
const hiddenOk = html.includes('display:none!important') && html.includes('id="deck-time"') && html.includes('id="weather-widget"');
console.log(hiddenOk ? '✅ 隐藏指挥台保留原 ID' : '❌ 隐藏指挥台问题');

// 3. 卫星按钮数量 + data-drawer
const sats = html.match(/class="sat sat-\d"/g) || [];
const drawers = ['d1','d2','d3','d4','d5','d6','d7'];
const drawerOk = drawers.every(d => html.includes(`data-drawer="${d}"`));
console.log(`✅ 卫星数量: ${sats.length}` + (sats.length === 7 ? '' : ' ❌ 应该 7'));
console.log(drawerOk ? '✅ 7 个抽屉都有对应卫星' : '❌ 有抽屉缺卫星');

// 4. openDrawer 函数 + 卫星 onclick
console.log(html.includes('function openDrawer') ? '✅ openDrawer 函数存在' : '❌ openDrawer 缺失');
console.log(html.includes("openDrawer('d7'") ? '✅ 卫星点击绑定' : '❌ 卫星点击未绑定');

// 5. 轨道动画
console.log(html.includes('@keyframes orbitSpin') ? '✅ 轨道旋转动画' : '❌ 轨道动画缺失');

// 6. 黑金配色
console.log(html.includes('212,175,106') ? '✅ 黑金配色 (#d4af6a)' : '❌ 金色缺失');

// 7. 手机端适配
console.log(html.includes('@media (max-width: 760px)') ? '✅ 手机端适配' : '❌ 手机端适配缺失');

// 8. 卫星定位（角度分布）
const pos = ['sat-1','sat-2','sat-3','sat-4','sat-5','sat-6','sat-7'].map(s => html.includes('.' + s + ' {') ? '✅' : '❌');
console.log('卫星定位: ' + pos.join(' '));

// 9. 检查是否还有旧版残留（command-deck 可见）
const oldVisible = html.includes('min-height: calc(100vh - 90px)');
console.log(oldVisible ? '⚠️ 旧版全屏指挥台 CSS 残留（无害但占体积）' : '✅ 无旧版残留');

// 10. 对话抽屉/快速捕获等核心功能
const funcs = ['openCapture', 'openHelp', 'sendChat', 'renderFocus', 'renderTodos', 'renderProjects', 'renderSchedule', 'renderTrack'];
const miss = funcs.filter(f => !html.includes('function ' + f));
console.log(miss.length === 0 ? '✅ 核心功能函数齐全' : '❌ 缺失: ' + miss.join(', '));
