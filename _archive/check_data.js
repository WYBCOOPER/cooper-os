// 确认课程表数据存储方式 + 检查数据文件
const fs = require('fs');

// 1. 检查数据是存在 localStorage 还是文件
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');
console.log('=== 课程表数据存储方式 ===');
// 找 store 的 save/load 实现
const storeIdx = html.indexOf('const store');
if (storeIdx >= 0) console.log(html.slice(storeIdx, storeIdx + 500));
else {
  // 找 localStorage 用法
  const ls = html.match(/localStorage[^;]{0,80}/g) || [];
  console.log('localStorage 用法:', ls.length, '处');
  ls.slice(0, 5).forEach(x => console.log(' ', x.trim()));
}

// 2. 检查数据文件
console.log('\n=== 数据文件检查 ===');
['cooper-os-data.json', 'data.json', 'backup.json'].forEach(f => {
  const p = 'C:/Users/wyb/Desktop/草哥工作台/' + f;
  if (fs.existsSync(p)) {
    const sz = fs.statSync(p).size;
    console.log(f, '✅', (sz / 1024).toFixed(1), 'KB');
    try {
      const d = JSON.parse(fs.readFileSync(p, 'utf8'));
      const c = d.courses || d.cg_courses_v2 || [];
      console.log('  含课程数据:', c.length > 0 ? '✅ ' + c.length + ' 条' : '⚠️ 空');
    } catch(e) { console.log('  解析失败:', e.message); }
  } else {
    console.log(f, '❌ 不存在');
  }
});
