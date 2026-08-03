// 确认当前板块配置
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

const dials = html.match(/class="dial dial-\d"/g) || [];
console.log('dial 数量:', dials.length, dials.join(', '));

// 列出每个 dial 的 label
const labels = [];
for (let i = 1; i <= 7; i++) {
  const re = new RegExp('data-drawer="d\\d"[^>]*>[\\s\\S]*?<div class="d-label">([^<]+)</div>');
  // 直接找 dial-i 里的 label
  const dIdx = html.indexOf('class="dial dial-' + i + '"');
  if (dIdx >= 0) {
    const seg = html.slice(dIdx, dIdx + 500);
    const m = seg.match(/d-label">([^<]+)</);
    labels.push('dial-' + i + ' = ' + (m ? m[1] : '?'));
  }
}
console.log('板块:', labels.join(' | '));

// 检查抽屉是否都保留
['d1','d2','d3','d4','d5','d6','d7'].forEach(d => {
  console.log(d, html.includes('id="' + d + '"') ? '✅' : '❌');
});
