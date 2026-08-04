// 修复打包配置：加上雪山背景图
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.build.files = ['main.js', 'index.html', 'manifest.json', 'sw.js', 'icon-512.png', 'icon-192.png', 'server.js', 'snow_peaks_v6.png'];
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
console.log('✅ build.files 已加上 snow_peaks_v6.png');
console.log('当前 files: ' + p.build.files.join(', '));
