// 检查 galaxy-core 月亮圆盘的完整内容和样式
const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

// 找 galaxy-core HTML
const gc = s.indexOf('<div class="galaxy-core"');
console.log('=== galaxy-core HTML ===');
console.log(s.slice(gc, gc + 1200).replace(/\s+/g, ' '));

console.log('\n=== core-time / core-date / core-focus 样式 ===');
['core-time', 'core-date', 'core-label', 'core-focus', 'core-weather', 'core-add', 'core-ddl'].forEach(k => {
  const re = new RegExp('\\.' + k + '\\s*\\{');
  const m = re.exec(s);
  if (m) {
    const end = s.indexOf('}', m.index);
    console.log('.' + k + ': ' + s.slice(m.index, end + 1).replace(/\s+/g, ' '));
  }
});
