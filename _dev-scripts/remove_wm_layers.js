// 移除所有水印遮挡层（水印已从图片文件清除，遮挡层不再需要）
const fs = require('fs');
const path = 'index.html';
let s = fs.readFileSync(path, 'utf8');

let removed = 0;

// 1. 移除 wm-cover CSS
const wmCssStart = s.indexOf('/* ===== 全屏水印遮罩');
if (wmCssStart >= 0) {
  const wmCssEnd = s.indexOf('</style>', wmCssStart);
  const block = s.slice(wmCssStart, wmCssEnd);
  s = s.replace(block, '');
  console.log('✅ 已移除 wm-cover CSS');
  removed++;
}

// 2. 移除 wm-cover div
const wmDiv = '<div class="wm-cover"></div>';
if (s.includes(wmDiv)) {
  s = s.replace(wmDiv, '');
  console.log('✅ 已移除 wm-cover div');
  removed++;
}

// 3. 移除 galaxy-wm-mask CSS
const gmCssStart = s.indexOf('/* 水印遮挡：右下角小色块');
if (gmCssStart >= 0) {
  const gmCssEnd = s.indexOf('}', gmCssStart) + 1;
  s = s.slice(0, gmCssStart) + s.slice(gmCssEnd);
  console.log('✅ 已移除 galaxy-wm-mask CSS');
  removed++;
}

// 4. 移除 galaxy-wm-mask div
const gmDiv = '<div class="galaxy-wm-mask"></div>';
if (s.includes(gmDiv)) {
  s = s.replace(gmDiv, '');
  console.log('✅ 已移除 galaxy-wm-mask div');
  removed++;
}

fs.writeFileSync(path, s);
console.log('✅ index.html 已保存（移除 ' + removed + ' 处遮挡）');
fs.copyFileSync(path, '草哥工作台.html');
console.log('✅ 网页版已同步');
