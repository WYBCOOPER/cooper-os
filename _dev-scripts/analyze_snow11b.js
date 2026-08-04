// 找 index.html 里实际板块结构
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

// 找所有 id="xxx" 里包含数字的，或找板块关键词
console.log('=== 找所有 id 属性（前 60 个）===');
const idRe = /id="([^"]+)"/g;
let m, count = 0;
while ((m = idRe.exec(s)) !== null && count < 60) {
  console.log(m[1]);
  count++;
}

console.log('\n=== 找 galaxy 相关上下文 ===');
const gIdx = s.indexOf('galaxy');
console.log(s.slice(Math.max(0, gIdx - 300), gIdx + 400));
