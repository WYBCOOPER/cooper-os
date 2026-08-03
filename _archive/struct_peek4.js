// 检查原 JS 里引用被替换元素（deck-time/weather-widget 等）的代码
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

const targets = ['deck-time', 'deck-date', 'weather-widget', 'deck-focus', 'deck-ddl', 'deck-next', 'deck-add', 'deck-title', 'command-deck'];
targets.forEach(t => {
  let count = 0;
  const re = new RegExp(t.replace(/-/g, '\\-'), 'g');
  let m;
  const positions = [];
  while ((m = re.exec(html)) && count < 10) { positions.push(m.index); count++; }
  console.log(t, '→ 出现', count, '次', positions.slice(0, 5).join(', '));
});

// 找设置时钟的代码
const clockIdx = html.indexOf('deck-time');
console.log('\n=== 时钟更新代码附近 ===\n');
if (clockIdx >= 0) {
  console.log(html.slice(clockIdx - 300, clockIdx + 300));
}
