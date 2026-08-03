// v3：扩大提取范围（用第一次成功的方法 + 更大截断 + 括号配平）
const fs = require('fs');
const path = require('path');

const lsDir = path.join(process.env.APPDATA, 'cooper-os', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsDir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));
const targets = ['cg_track', 'cg_track_today', 'cg_sleep', 'cg_splits', 'cg_todos', 'cg_ddls'];

function extract(keyName) {
  for (const f of files) {
    try {
      const buf = fs.readFileSync(path.join(lsDir, f));
      const text = buf.toString('utf8'); // latin1 视角
      const idx = text.indexOf(keyName);
      if (idx < 0) continue;
      console.log('🔍', keyName, '在', f, '@', idx);
      
      // 从 key 后取大段（50KB），转 UTF-16
      const after = text.slice(idx + keyName.length, idx + keyName.length + 50000);
      const u16 = Buffer.from(after, 'latin1').swap16().toString('utf8');
      
      // 括号配平找完整 JSON
      const start = u16.indexOf('{');
      if (start < 0) { console.log('   ⚠️ 无 {'); continue; }
      let depth = 0, end = -1;
      for (let i = start; i < u16.length; i++) {
        if (u16[i] === '{') depth++;
        if (u16[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      if (end < 0) { console.log('   ⚠️ 括号未配平'); continue; }
      
      const jsonStr = u16.slice(start, end);
      try {
        const parsed = JSON.parse(jsonStr);
        return { file: f, data: parsed };
      } catch(e) {
        console.log('   ⚠️ JSON 解析失败:', e.message.slice(0, 50));
        console.log('   片段头:', jsonStr.slice(0, 150));
      }
    } catch(e) {}
  }
  return null;
}

console.log('=== v3 提取 ===\n');
const results = {};
targets.forEach(t => {
  const r = extract(t);
  if (r) {
    results[t] = r.data;
    const s = JSON.stringify(r.data);
    console.log('✅', t, '←', r.file, '|', s.length, '字符');
    if (Array.isArray(r.data)) console.log('   数组长度:', r.data.length, '| 首个:', JSON.stringify(r.data[0]).slice(0, 120));
    else console.log('   内容:', s.slice(0, 120));
  } else {
    console.log('❌', t, '未提取');
  }
  console.log('');
});

// 合并
const dataFile = 'C:/Users/wyb/Desktop/草哥工作台/cooper-os-data.json';
let serverData = {};
try { serverData = JSON.parse(fs.readFileSync(dataFile, 'utf8')); } catch {}

let merged = 0;
Object.keys(results).forEach(k => {
  if (serverData[k] === undefined || serverData[k] === null) {
    serverData[k] = results[k];
    merged++;
    console.log('➕ 合并', k);
  }
});
if (merged > 0) {
  fs.writeFileSync(dataFile, JSON.stringify(serverData, null, 2));
  console.log(`\n✅ 合并 ${merged} 键，服务器 JSON 已更新`);
} else {
  console.log('\nℹ️ 无新键');
}
