// 检查 body 背景设置 + 找遮挡容器
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

console.log('=== 1. body 背景设置确认 ===');
const bodyRe = s.match(/body\s*\{[^}]*background[^}]*\}/g);
if (bodyRe) bodyRe.forEach((b, i) => {
  console.log('body#' + i + ': ' + b.replace(/\s+/g, ' ').slice(0, 250));
});

console.log('\n=== 2. 找可能遮挡的不透明容器 ===');
// 找 main 容器 / wrapper / app 等
['.shell', '#app', '.main', '.container', '.page', '.wrap'].forEach(k => {
  const re = new RegExp('\\' + k + '\\s*\\{[^}]*\\}', 'g');
  let m;
  while ((m = re.exec(s)) !== null) {
    const hasBg = /background/.test(m[0]);
    console.log(k + (hasBg ? ' (有背景): ' : ' (无背景): ') + m[0].replace(/\s+/g, ' ').slice(0, 180));
  }
});

console.log('\n=== 3. body 标签后的第一个主要容器 ===');
const bodyIdx = s.indexOf('<body');
console.log(s.slice(bodyIdx, bodyIdx + 300).replace(/\s+/g, ' ').slice(0, 300));
