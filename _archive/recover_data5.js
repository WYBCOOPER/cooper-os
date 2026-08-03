// v5：纯 Buffer UTF-16LE 解析（处理数组 + 中文）
const fs = require('fs');
const path = require('path');

const lsDir = path.join(process.env.APPDATA, 'cooper-os', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsDir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

function findKey(buf, key) {
  // key 的 UTF-16LE 字节
  const keyBuf = Buffer.from(key, 'utf16le');
  for (let i = 0; i <= buf.length - keyBuf.length; i++) {
    if (buf[i] === keyBuf[0] && buf[i + 1] === keyBuf[1]) {
      let ok = true;
      for (let j = 0; j < keyBuf.length; j++) {
        if (buf[i + j] !== keyBuf[j]) { ok = false; break; }
      }
      if (ok) return i + keyBuf.length;
    }
  }
  return -1;
}

function extractValue(buf, startPos) {
  // 从 startPos 起，toString utf16le（忽略前几个格式字节）
  for (let skip = 0; skip <= 12; skip++) {
    try {
      const u16 = buf.toString('utf16le', startPos + skip, Math.min(buf.length, startPos + skip + 100000));
      // 找 [ 或 {
      const start = u16.search(/[\{\[]/);
      if (start < 0) continue;
      const open = u16[start];
      const close = open === '{' ? '}' : ']';
      let depth = 0, end = -1;
      for (let i = start; i < u16.length; i++) {
        if (u16[i] === open) depth++;
        if (u16[i] === close) { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      if (end > 0) {
        const jsonStr = u16.slice(start, end);
        const parsed = JSON.parse(jsonStr);
        return parsed;
      }
    } catch(e) {}
  }
  return undefined;
}

const targets = ['cg_track', 'cg_track_today', 'cg_sleep', 'cg_splits', 'cg_todos', 'cg_ddls', 'cg_water', 'cg_focus', 'cg_projects', 'cg_schedule', 'cg_courses_v2', 'cg_meds', 'cg_clubs', 'cg_journal', 'cg_reviews'];

console.log('=== v5 纯 Buffer 提取 ===\n');
const results = {};

files.forEach(f => {
  const buf = fs.readFileSync(path.join(lsDir, f));
  targets.forEach(t => {
    if (results[t]) return;
    const pos = findKey(buf, t);
    if (pos < 0) return;
    const parsed = extractValue(buf, pos);
    if (parsed !== undefined) {
      results[t] = parsed;
      const s = JSON.stringify(parsed);
      console.log('✅', t, '←', f, '|', s.length, '字符');
      if (Array.isArray(parsed)) console.log('   数组:', parsed.length, '项 | 首项:', JSON.stringify(parsed[0]).slice(0, 130));
    }
  });
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
  console.log(`\n✅ 合并 ${merged} 键！服务器 JSON 已更新`);
} else {
  console.log('\nℹ️ 无新键');
}
