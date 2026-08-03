// 紧急：检查数据完整性 + 尝试恢复打卡数据
const fs = require('fs');

// 1. 服务器 JSON 完整内容
const dataFile = 'C:/Users/wyb/Desktop/草哥工作台/cooper-os-data.json';
try {
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log('=== 服务器 JSON 所有键 ===');
  Object.keys(data).forEach(k => {
    const v = data[k];
    const type = Array.isArray(v) ? 'array[' + v.length + ']' : typeof v;
    console.log(' ', k, '→', type);
  });
  
  // 打卡相关键
  console.log('\n=== 打卡相关数据 ===');
  ['cg_track', 'cg_track_today', 'cg_water', 'cg_sleep', 'cg_splits'].forEach(k => {
    console.log(' ', k, '→', data[k] !== undefined ? JSON.stringify(data[k]).slice(0, 100) : '❌ 不存在');
  });
} catch(e) { console.log('JSON 解析失败:', e.message); }

// 2. 查找其他备份文件
console.log('\n=== 备份文件 ===');
const dir = 'C:/Users/wyb/Desktop/草哥工作台';
fs.readdirSync(dir).filter(f => /backup|bak|备份/i.test(f)).forEach(f => {
  const sz = fs.statSync(dir + '/' + f).size;
  console.log(' ', f, (sz/1024).toFixed(1) + 'KB');
});
