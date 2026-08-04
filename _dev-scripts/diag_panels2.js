// 深挖 COOPER OS 板块结构（星系版）
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 找 galaxy / dial / 卫星相关结构
console.log('=== 星系/卫星相关关键词 ===');
['galaxy', 'dial', 'satellite', 'orbit', '板块', 'panel-'].forEach(k => {
  const n = (html.match(new RegExp(k, 'g')) || []).length;
  console.log(k, '→', n, '处');
});

// 找 id 或 class 含板块的
console.log('\n=== 面板 class ===');
const panels = html.match(/class="[^"]*(panel|dial|module|section)[^"]*"/g) || [];
const uniq = [...new Set(panels)].slice(0, 30);
uniq.forEach(p => console.log(' ', p.slice(0, 80)));

// 找标题型文本（中文字符 2-6 个的标题）
console.log('\n=== 疑似板块标题（中文短词）===');
const titles = html.match(/>([\u4e00-\u9fa5]{2,6})<\/[a-z]/g) || [];
const seen = new Set();
titles.forEach(t => {
  const word = t.replace(/[>\/<a-z]/g, '');
  if (!seen.has(word) && word.length >= 2 && word.length <= 5) {
    seen.add(word);
    console.log(' ', word);
  }
});
