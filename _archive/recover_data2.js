// 更精确地从 exe leveldb 提取 cg_track（UTF-16LE 编码）
const fs = require('fs');
const path = require('path');

const lsDir = path.join(process.env.APPDATA, 'cooper-os', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsDir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

// 目标：cg_track（数组），cg_track_today（对象），cg_sleep，cg_splits，cg_todos
const targets = ['cg_track', 'cg_track_today', 'cg_sleep', 'cg_splits', 'cg_todos', 'cg_ddls', 'cg_focus'];

// LevelDB localStorage 值以 UTF-16LE 存储，前面有 2 字节长度前缀
function extract(target) {
  for (const f of files) {
    const buf = fs.readFileSync(path.join(lsDir, f));
    // 转 UTF-16LE 文本（跳过头）
    const u16 = buf.toString('utf16le');
    const idx = u16.indexOf(target);
    if (idx < 0) continue;
    
    // 从 target 之后开始找 JSON
    const after = u16.slice(idx + target.length);
    // 找第一个 { 
    const start = after.indexOf('{');
    if (start < 0) continue;
    // 括号配平找完整 JSON
    let depth = 0, end = -1;
    for (let i = start; i < after.length && i < start + 20000; i++) {
      if (after[i] === '{') depth++;
      if (after[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    if (end > 0) {
      const jsonStr = after.slice(start, end);
      try {
        const parsed = JSON.parse(jsonStr);
        return { file: f, data: parsed };
      } catch(e) {
        console.log('  ⚠️', target, 'JSON 解析失败 in', f, ':', e.message.slice(0, 40));
        console.log('  片段:', jsonStr.slice(0, 120));
      }
    }
  }
  return null;
}

console.log('=== UTF-16 提取 ===');
const results = {};
targets.forEach(t => {
  const r = extract(t);
  if (r) {
    results[t] = r.data;
    const s = JSON.stringify(r.data);
    console.log('✅', t, '←', r.file, '|', s.slice(0, 100));
  } else {
    console.log('⚠️', t, '未提取');
  }
});

// 合并到服务器 JSON
const dataFile = 'C:/Users/wyb/Desktop/草哥工作台/cooper-os-data.json';
let serverData = {};
try { serverData = JSON.parse(fs.readFileSync(dataFile, 'utf8')); } catch {}

let merged = 0;
Object.keys(results).forEach(k => {
  if (serverData[k] === undefined || serverData[k] === null) {
    serverData[k] = results[k];
    merged++;
    console.log('➕ 合并', k);
  } else {
    console.log('⏭ 保留', k);
  }
});

if (merged > 0) {
  fs.writeFileSync(dataFile, JSON.stringify(serverData, null, 2));
  console.log(`\n✅ 新增合并 ${merged} 个键！服务器 JSON 已更新`);
} else {
  console.log('\nℹ️ 没有新键可合并');
}
