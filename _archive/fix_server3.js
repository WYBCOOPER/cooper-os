// 扫描 server.js 所有乱码行并清理
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
let s = fs.readFileSync(path, 'utf8');

// 扫描所有 PUA/替换字符行
const lines = s.split('\n');
let fixed = 0;
for (let i = 0; i < lines.length; i++) {
  const hasPUA = /[\uE000-\uF8FF]/.test(lines[i]);
  const hasReplacement = lines[i].includes('\uFFFD');
  const hasMojibake = /[\u9519\u65B9\u7A0B\u7EC4\u8868\u5934\u5F3A\u6BDB\u7EC7\u9501]/.test(lines[i]);
  if (hasPUA || hasReplacement || hasMojibake) {
    // 如果是 console.log 里的中文，替换为英文或清理
    const cleaned = lines[i]
      .replace(/[\uE000-\uF8FF\uFFFD]/g, '')
      .replace(/'[^']*'\)/, "'COOPER OS server started' )")
      .trim();
    lines[i] = cleaned;
    fixed++;
    console.log('第', i + 1, '行已清理');
  }
}
console.log('共清理:', fixed, '行');

// 检查是否有中文注释残留乱码但语法可接受
s = lines.join('\n');
fs.writeFileSync(path, s);
console.log('✅ 写入完成');
