// 更新界面里的版本显示
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. 帮助手册标题版本
const old1 = 'COOPER OS 使用手册';
const idx1 = html.indexOf(old1);
if (idx1 >= 0) {
  // 找同一行里的 v10.2
  const seg = html.slice(idx1, idx1 + 100);
  const m = seg.match(/v10\.2[^<"]*/);
  if (m) {
    html = html.replace(m[0], 'v10.3');
    console.log('✅ 帮助手册版本 → v10.3');
  }
}

// 2. 项目数据里的版本（这个是 localStorage 默认数据，可能存在于 JS 里）
const old2 = "version: '10.2.1'";
if (html.includes(old2)) {
  html = html.replace(old2, "version: '10.3.0'");
  console.log('✅ 项目数据版本 → 10.3.0');
}

// 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);

fs.writeFileSync(path, html);
console.log('✅ 版本显示更新完成');
