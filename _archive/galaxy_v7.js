// 修正 :root 变量为黑金 v7
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

const oldRoot = `:root {
    --bg: #04070f;
    --card: rgba(18, 26, 46, 0.62);
    --card-strong: rgba(22, 32, 56, 0.88);
    --border: rgba(96, 140, 255, 0.14);
    --text: #e8eefb;
    --text-dim: #8fa0c8;
    --text-faint: #5d6d95;
    --accent: #4f8dff;
    --accent2: #6fb6ff;
    --accent-soft: rgba(79,141,255,0.14);
    --green: #4fe3c1;
    --yellow: #ffc857;
    --red: #ff7a94;
    --radius: 22px;
    --mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  }`;

const newRoot = `:root {
    --bg: #05060a;
    --card: rgba(16, 19, 28, 0.62);
    --card-strong: rgba(21, 25, 36, 0.88);
    --border: rgba(212, 175, 106, 0.14);
    --text: #efe9dc;
    --text-dim: #a89f8c;
    --text-faint: #6e6758;
    --accent: #d4af6a;
    --accent2: #e8c98f;
    --accent-soft: rgba(212,175,106,0.14);
    --green: #4fe3c1;
    --yellow: #ffc857;
    --red: #ff7a94;
    --radius: 22px;
    --mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  }`;

if (html.includes(oldRoot)) {
  html = html.replace(oldRoot, newRoot);
  console.log('✅ :root 变量已改为黑金');
} else {
  console.log('⚠️ :root 未精确匹配，检查当前内容');
  const m = html.match(/:root\s*\{[^}]*\}/);
  if (m) console.log(m[0].slice(0, 400));
}

// 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);

fs.writeFileSync(path, html);
console.log('✅ v7 完成');
