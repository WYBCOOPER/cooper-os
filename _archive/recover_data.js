// 恢复 + 长久方案：从 exe localStorage 提取打卡数据，合并到服务器
const fs = require('fs');
const path = require('path');

// ============ 1. 从 exe leveldb 提取 cg_track 等数据 ============
const lsDir = path.join(process.env.APPDATA, 'cooper-os', 'Local Storage', 'leveldb');
const keys = ['cg_track', 'cg_track_today', 'cg_water', 'cg_sleep', 'cg_splits', 'cg_focus', 'cg_todos', 'cg_ddls'];

function extractFromLevelDB(keyName) {
  const files = fs.readdirSync(lsDir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));
  for (const f of files) {
    try {
      const buf = fs.readFileSync(path.join(lsDir, f));
      const text = buf.toString('utf8');
      // 找 key 的 UTF-16 编码出现位置
      const utf16Key = keyName.split('').map(c => '\\x00' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      const idx = text.indexOf(keyName);
      if (idx < 0) continue;
      // 在 key 后面找 JSON 起始（可能 UTF-16：每个字符后带 \x00）
      const after = text.slice(idx + keyName.length, idx + keyName.length + 2000);
      // 尝试解析 UTF-16LE JSON
      const u16 = Buffer.from(after, 'latin1').swap16().toString('utf8');
      // 找 { ... } 完整 JSON
      const jsonMatch = u16.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        } catch(e) {}
      }
      // 尝试直接找 JSON
      const direct = after.match(/\{[\s\S]*?\}/);
      if (direct) {
        try {
          const parsed = JSON.parse(direct[0]);
          return parsed;
        } catch(e) {}
      }
    } catch(e) {}
  }
  return undefined;
}

console.log('=== 从 exe localStorage 提取数据 ===');
const recovered = {};
keys.forEach(k => {
  const v = extractFromLevelDB(k);
  if (v !== undefined) {
    recovered[k] = v;
    console.log('✅', k, '→', JSON.stringify(v).slice(0, 80));
  } else {
    console.log('⚠️', k, '未提取到');
  }
});

// ============ 2. 合并到服务器 JSON（不覆盖现有！） ============
const dataFile = 'C:/Users/wyb/Desktop/草哥工作台/cooper-os-data.json';
let serverData = {};
try { serverData = JSON.parse(fs.readFileSync(dataFile, 'utf8')); } catch {}

// 备份服务器数据（防止丢失）
const bakFile = dataFile + '.bak-' + Date.now();
fs.writeFileSync(bakFile, JSON.stringify(serverData, null, 2));
console.log('\n📦 服务器数据已备份:', path.basename(bakFile));

let merged = 0;
Object.keys(recovered).forEach(k => {
  // 服务器没有的键 → 合并（有则保留服务器较新的）
  if (serverData[k] === undefined || serverData[k] === null) {
    serverData[k] = recovered[k];
    merged++;
    console.log('➕ 合并', k);
  } else {
    console.log('⏭ 保留服务器现有', k);
  }
});

fs.writeFileSync(dataFile, JSON.stringify(serverData, null, 2));
console.log(`\n✅ 合并完成：新增 ${merged} 个数据键，服务器 JSON 已更新`);
console.log('最终键列表:', Object.keys(serverData).join(', '));
