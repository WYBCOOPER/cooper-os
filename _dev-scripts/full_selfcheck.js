// COOPER OS v10.3.1 全面自检（覆盖避坑清单 + 已知问题）
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('✅ ' + name); }
  else { fail++; console.log('❌ ' + name + (detail ? ' — ' + detail : '')); }
}

console.log('===== 1. 功能完整性 =====');
// 7 个抽屉
['d1','d2','d3','d4','d5','d6','d7'].forEach(id => {
  check('抽屉 ' + id, s.includes('id="' + id + '"'), '未找到');
});
// 7 个 dial 按钮
for (let n = 1; n <= 7; n++) {
  check('板块按钮 dial-' + n, s.includes('dial dial-' + n), '未找到');
}
// 关键函数
['openDrawer', 'addFocus', 'renderDDL', 'saveFocus', 'toggleWater', 'renderWater'].forEach(fn => {
  check('函数 ' + fn, s.includes('function ' + fn) || s.includes(fn + ' ='), '未找到');
});

console.log('\n===== 2. 浮层默认隐藏（避坑清单致命项）=====');
// modal-overlay 初始样式
const modalRe = s.match(/\.modal-overlay\s*\{[^}]*\}/);
if (modalRe) {
  const m = modalRe[0];
  check('modal-overlay 默认隐藏', /display:\s*none/.test(m), m.replace(/\s+/g,' ').slice(0, 80));
} else check('modal-overlay 样式存在', false);

console.log('\n===== 3. 雪山界面元素 =====');
check('背景图引用', s.includes('snow_peaks_v6.png'), '图片引用缺失');
check('水印遮挡层', s.includes('galaxy-wm-mask'), '水印遮挡缺失');
check('底部渐隐', s.includes('mask-image'), '渐隐缺失');
check('月亮圆盘', s.includes('galaxy-core'), '圆盘缺失');
check('＋今日聚焦按钮可见', /\.core-add\s*\{[^}]*display:\s*(?!none)/.test(s + ' '), '被隐藏!');
check('DDL 可见', /\.core-ddl\s*\{[^}]*display:\s*(?!none)/.test(s + ' '), '被隐藏!');
check('天气可见', /\.core-weather\s*\{[^}]*display:\s*(?!none)/.test(s + ' '), '被隐藏!');

console.log('\n===== 4. 已知问题复发检查 =====');
// 弹窗卡死：modal 默认 flex（历史坑）
const modalOpen = s.match(/modal-overlay\.open\s*\{[^}]*\}/);
check('弹窗 .open 才显示', !modalOpen || /display:\s*flex/.test(modalOpen[0]) ? true : false, '');
// 重复大圆球（历史坑：旧 galaxy 残留）
const galaxyCount = (s.match(/class="galaxy"/g) || []).length;
check('无重复 galaxy 容器', galaxyCount <= 1, '发现 ' + galaxyCount + ' 个 galaxy');
// 毛玻璃（宝宝禁止）
const blurCount = (s.match(/backdrop-filter:\s*blur/g) || []).length;
check('无毛玻璃残留', blurCount === 0, '发现 ' + blurCount + ' 处 backdrop-filter');
// 日期分桶（今日聚焦按日期）
check('聚焦按日期分桶', s.includes('cg_focus_daily'), '未找到');

console.log('\n===== 5. JS 语法 =====');
const scripts = s.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
let jsOk = true;
scripts.forEach((sc, i) => {
  const code = sc.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  if (!code.trim()) return;
  try { new Function(code); } catch (e) { jsOk = false; console.log('  ❌ script#' + i + ': ' + e.message); }
});
check('全部 script 语法', jsOk, scripts.length + ' 个 script');

console.log('\n===== 结果: ' + pass + ' 通过 / ' + fail + ' 失败 =====');
process.exit(fail > 0 ? 1 : 0);
