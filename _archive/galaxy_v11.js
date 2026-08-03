// 清理残留旧卫星 + 校验
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 找所有旧卫星 HTML（class="sat sat-N"）
const satRe = /<div class="sat sat-\d"[^>]*data-drawer="[^"]*"[^>]*>[\s\S]*?<\/div>\n/g;
const found = html.match(satRe) || [];
console.log('找到旧卫星块:', found.length);

// 删除每个卫星块
let removed = 0;
found.forEach(block => {
  if (html.includes(block)) {
    html = html.replace(block, '');
    removed++;
  }
});
console.log('已删除:', removed);

// 再检查残留
const remain = html.match(/class="sat sat-/g) || [];
console.log('残留:', remain.length);

// 检查 .sat CSS 是否还有（留着无害，但清理干净）
const cssRemain = html.match(/\.sat-1 \{|\.sat-2 \{/g) || [];
console.log('残留定位 CSS:', cssRemain.length, '处（无害可留）');

// 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

fs.writeFileSync(path, html);
console.log('\n✅ 清理完成！大小:', (html.length / 1024).toFixed(1), 'KB');
