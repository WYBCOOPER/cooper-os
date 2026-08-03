// 长久方案：server.js 加自动备份（每次保存前备份旧数据）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
let s = fs.readFileSync(path, 'utf8');

// 1. 保存函数加自动备份（保留最近 20 份）
const oldSave = `function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}`;
const newSave = `function saveData(data) {
  // 🔒 自动备份：保存前把旧数据备份（防误删/覆盖）
  try {
    const bakDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(bakDir)) fs.mkdirSync(bakDir);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    fs.writeFileSync(path.join(bakDir, 'data-' + stamp + '.json'), JSON.stringify(data, null, 2));
    // 只保留最近 20 份
    const baks = fs.readdirSync(bakDir).filter(f => f.startsWith('data-')).sort();
    while (baks.length > 20) {
      fs.unlinkSync(path.join(bakDir, baks.shift()));
    }
  } catch(e) {}
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}`;
if (s.includes(oldSave)) {
  s = s.replace(oldSave, newSave);
  console.log('✅ server.js 自动备份已加（backups/ 保留 20 份）');
} else {
  console.log('⚠️ saveData 未匹配');
}

fs.writeFileSync(path, s);
console.log('✅ 完成');
