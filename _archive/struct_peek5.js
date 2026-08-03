// 查看 script 里对这些 ID 的引用方式
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// script 开始位置
const scriptIdx = html.indexOf('<script>');
console.log('script 开始:', scriptIdx);

// 找所有 getElementById 引用这些元素的地方
const targets = ['deck-time', 'deck-date', 'weather-widget', 'deck-focus', 'deck-ddl', 'deck-next'];
targets.forEach(t => {
  console.log('\n=== ' + t + ' 的 JS 引用 ===');
  const re = new RegExp('.{0,80}' + t + '.{0,80}', 'g');
  let m;
  let shown = 0;
  while ((m = re.exec(html)) && shown < 3) {
    // 只显示 script 之后的
    if (m.index > scriptIdx) {
      console.log('  @' + m.index + ': ' + m[0].replace(/\n/g, ' '));
      shown++;
    }
  }
});
