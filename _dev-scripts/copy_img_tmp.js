// 步骤1：复制图片到无中文路径
const fs = require('fs');
const src = 'C:/Users/wyb/Desktop/草哥工作台/snow_peaks_v6.png';
const tmp = 'C:/Users/wyb/.openclaw/workspace/tmp_clean_wm.png';
fs.copyFileSync(src, tmp);
console.log('✅ 已复制到无中文路径: ' + tmp);
