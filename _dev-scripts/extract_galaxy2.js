// 找 dial-1 ~ dial-7 的定位 CSS
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

for (let n = 1; n <= 7; n++) {
  const re = new RegExp('\\.dial-' + n + '\\s*\\{');
  const m = re.exec(s);
  if (m) {
    const start = m.index;
    const end = s.indexOf('}', start);
    console.log('.dial-' + n + ': ' + s.slice(start, end + 1).replace(/\s+/g, ' '));
  } else {
    console.log('.dial-' + n + ': ❌ 无独立定位（可能用 nth-child 或 JS）');
  }
}

// 找 galaxy 容器定位方式
console.log('\n=== .dial 的定位依据 ===');
const dialCss = s.indexOf('.dial {');
const dialEnd = s.indexOf('}', dialCss);
console.log(s.slice(dialCss, dialEnd + 1).replace(/\s+/g, ' '));

// 找有没有 JS 动态设置 dial 位置
console.log('\n=== JS 中 dial 定位 ===');
const jsDial = s.match(/dial-\d[\s\S]{0,80}?(left|top|transform)/g);
if (jsDial) jsDial.slice(0, 8).forEach(x => console.log(x.slice(0, 120)));
else console.log('未找到 JS 动态定位 dial');
