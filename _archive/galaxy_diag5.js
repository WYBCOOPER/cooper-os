// 检查当前 dial 数量与位置
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 所有 dial 元素 ===');
const dials = html.match(/<div class="dial dial-[^"]*"[^>]*data-drawer="[^"]*"[^>]*>[\s\S]*?<\/div>\n  <\/div>/g) || [];
// 更简单的匹配
const dialTags = html.match(/class="dial dial-\w+"/g) || [];
console.log('dial 数量:', dialTags.length, dialTags.join(', '));

console.log('\n=== dial 位置 CSS ===');
['dial-l1', 'dial-l2', 'dial-r1', 'dial-r2'].forEach(c => {
  const m = html.match(new RegExp('\\\\.' + c + ' \\\\{[^}]*\\\\}'));
  console.log(m ? m[0] : '❌ ' + c + ' 未定义');
});

console.log('\n=== dial HTML 内容 ===');
const dIdx = html.indexOf('dial-l1');
if (dIdx > 0) console.log(html.slice(dIdx - 100, dIdx + 1200));
