// 金色星云背景 v8：body::before 蓝色渐变 → 金色
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 找 body::before 完整定义
const start = html.indexOf('body::before {');
if (start < 0) { console.log('❌ body::before 未找到'); process.exit(1); }
const end = html.indexOf('\n  }', start) + 4;
console.log('=== 当前 body::before ===\n');
console.log(html.slice(start, end));

// 金色星云（深黑底 + 暖金微光）
const newBefore = `body::before {
    content:''; position: fixed; inset: 0; z-index: -2;
    background:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,106,0.10), transparent),
      radial-gradient(ellipse 60% 40% at 85% 100%, rgba(212,175,106,0.07), transparent),
      radial-gradient(ellipse 50% 40% at 10% 60%, rgba(160,130,80,0.06), transparent),
      radial-gradient(ellipse 70% 45% at 70% 30%, rgba(232,201,143,0.05), transparent);
    background-color: #05060a;
  }`;

html = html.slice(0, start) + newBefore + html.slice(end);
console.log('\n✅ body::before 已改为金色星云');

// 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);

fs.writeFileSync(path, html);
console.log('✅ v8 完成');
