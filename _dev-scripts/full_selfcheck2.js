// 修正自检：core-add 可见性判断（检查 display:none 是否出现在覆盖规则中）
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('===== 1. 功能完整性 =====');
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('✅ ' + name); }
  else { fail++; console.log('❌ ' + name + (detail ? ' — ' + detail : '')); }
}

['d1','d2','d3','d4','d5','d6','d7'].forEach(id => check('抽屉 ' + id, s.includes('id="' + id + '"')));
for (let n = 1; n <= 7; n++) check('板块按钮 dial-' + n, s.includes('dial dial-' + n));
['openDrawer', 'addFocus', 'renderDDL', 'saveFocus', 'toggleWater', 'renderWater'].forEach(fn => check('函数 ' + fn, s.includes('function ' + fn) || s.includes(fn + ' =')));

console.log('\n===== 2. 浮层默认隐藏 =====');
const modalRe = s.match(/\.modal-overlay\s*\{[^}]*\}/);
check('modal-overlay 默认隐藏', modalRe && /display:\s*none/.test(modalRe[0]));

console.log('\n===== 3. 雪山界面元素 =====');
check('背景图引用', s.includes('snow_peaks_v6.png'));
// 水印已从图片文件层面清除，遮挡层应已移除
check('无遮挡层残留（wm-cover）', !s.includes('wm-cover'), '残留遮挡层');
check('无遮挡层残留（galaxy-wm-mask）', !s.includes('galaxy-wm-mask'), '残留遮挡层');
check('底部渐隐', s.includes('mask-image'));
check('月亮圆盘', s.includes('galaxy-core'));
// core-add 可见：检查覆盖 CSS 里没有 display:none
const coreAddBlock = s.slice(s.indexOf('恢复 ＋今日聚焦'), s.indexOf('恢复 DDL'));
check('＋今日聚焦按钮可见', coreAddBlock.includes('.core-add') && !/\.core-add\s*\{[^}]*display:\s*none/.test(coreAddBlock));
const coreDdlBlock = s.slice(s.indexOf('恢复 DDL'), s.indexOf('</style>'));
check('DDL 可见', coreDdlBlock.includes('.core-ddl') && !/\.core-ddl\s*\{[^}]*display:\s*none/.test(coreDdlBlock));

console.log('\n===== 4. 已知问题复发检查 =====');
const galaxyCount = (s.match(/class="galaxy"/g) || []).length;
check('无重复 galaxy 容器', galaxyCount <= 1, '发现 ' + galaxyCount + ' 个');
// 可见元素毛玻璃已清（弹窗保留）
const visibleGlass = ['statusbar', 'deck-focus-item', 'drawer-nav', '.card'];
visibleGlass.forEach(sel => {
  const re = new RegExp('\\.' + sel.replace('.', '') + '\\s*\\{[^}]*backdrop-filter', 'g');
  // 检查清理规则是否存在
  check('毛玻璃清理 ' + sel, s.includes('/* ===== 毛玻璃清理') && s.includes(sel + ' { backdrop-filter: none'));
});
check('聚焦按日期分桶', s.includes('cg_focus_daily'));

console.log('\n===== 5. JS 语法 =====');
const scripts = s.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
let jsOk = true;
scripts.forEach((sc, i) => {
  const code = sc.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  if (!code.trim()) return;
  try { new Function(code); } catch (e) { jsOk = false; console.log('  ❌ script#' + i + ': ' + e.message); }
});
check('全部 script 语法', jsOk);

console.log('\n===== 结果: ' + pass + ' 通过 / ' + fail + ' 失败 =====');
process.exit(fail > 0 ? 1 : 0);
