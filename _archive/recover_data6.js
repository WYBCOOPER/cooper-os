// v6：直接 dump UTF-16LE 文本 + 正则提取 JSON（宽松模式）
const fs = require('fs');
const path = require('path');

const lsDir = path.join(process.env.APPDATA, 'cooper-os', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsDir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

// 把整个文件转 UTF-16LE 文本（宽松），然后找 key 后的 JSON
function dumpAndFind(keyName) {
  for (const f of files) {
    const buf = fs.readFileSync(path.join(lsDir, f));
    // 转 utf16le（从偶数偏移开始试）
    for (let off = 0; off < 2; off++) {
      try {
        const text = buf.toString('utf16le', off);
        const idx = text.indexOf(keyName);
        if (idx < 0) continue;
        // key 后找 [ 或 {
        const after = text.slice(idx + keyName.length);
        const startMatch = after.search(/[\{\[]/);
        if (startMatch < 0) continue;
        const start = startMatch;
        const open = after[start];
        const close = open === '{' ? '}' : ']';
        let depth = 0, end = -1;
        for (let i = start; i < after.length; i++) {
          if (after[i] === open) depth++;
          if (after[i] === close) { depth--; if (depth === 0) { end = i + 1; break; } }
        }
        if (end > 0) {
          const jsonStr = after.slice(start, end);
          try {
            const parsed = JSON.parse(jsonStr);
            return { file: f, data: parsed, offset: off };
          } catch(e) {}
        }
      } catch(e) {}
    }
  }
  return null;
}

const targets = ['cg_track', 'cg_track_today', 'cg_sleep', 'cg_splits', 'cg_todos', 'cg_ddls', 'cg_water', 'cg_focus', 'cg_projects', 'cg_schedule', 'cg_courses_v2', 'cg_meds', 'cg_clubs', 'cg_journal'];

console.log('=== v6 dump 提取 ===\n');
const results = {};
targets.forEach(t => {
  const r = dumpAndFind(t);
  if (r) {
    results[t] = r.data;
    const s = JSON.stringify(r.data);
    console.log('✅', t, '←', r.file, '(off=' + r.offset + ')', '|', s.length, '字符');
    if (Array.isArray(r.data)) console.log('   数组:', r.data.length, '项');
  } else {
    console.log('⚠️', t, '未提取');
  }
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
  console.log(`\n✅ 合并 ${merged} 键！`);
} else {
  console.log('\nℹ️ 无新键');
}
