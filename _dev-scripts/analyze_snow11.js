// 分析 index.html 的板块结构（用文件方式，不内联）
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
console.log('index.html 总长度:', s.length, '字符');

const ids = ['dial-1','dial-2','dial-3','dial-4','dial-5','dial-6','dial-7'];
ids.forEach(id => {
  const i = s.indexOf('id="' + id + '"');
  console.log(id + ': ' + (i >= 0 ? '第 ' + i + ' 字符处' : '❌ 未找到'));
});

console.log('\n=== 关键词统计 ===');
['galaxy','orbit','moon','focus-ring','dial-container','statusbar','topbar','water','今日聚焦'].forEach(k => {
  const c = (s.match(new RegExp(k, 'g')) || []).length;
  console.log(k + ': ' + c + ' 次');
});

console.log('\n=== 找样式定义区 ===');
const styleStart = s.indexOf('<style');
const styleEnd = s.indexOf('</style>');
console.log('style 区: ' + styleStart + ' ~ ' + styleEnd + ' (' + (styleEnd - styleStart) + ' 字符)');

console.log('\n=== 找 body 开始 ===');
const bodyStart = s.indexOf('<body');
console.log('body 开始: ' + bodyStart);

console.log('\n=== 找脚本区 ===');
const scriptStart = s.lastIndexOf('<script');
console.log('最后一个 <script: ' + scriptStart);
