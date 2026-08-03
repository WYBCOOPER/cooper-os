// v4：字节级 UTF-16LE 提取（处理 LevelDB 偏移）
const fs = require('fs');
const path = require('path');

const lsDir = path.join(process.env.APPDATA, 'cooper-os', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsDir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

// key 的 UTF-16LE 编码（每个字符 + \x00）
function utf16leKey(key) {
  let s = '';
  for (const ch of key) {
    const code = ch.charCodeAt(0);
    s += String.fromCharCode(code & 0xFF) + String.fromCharCode(code >> 8);
  }
  return s;
}

// 从 buffer 中找 key（字节级），返回 value 起点
function findKeyValue(buf, key) {
  const keyBytes = Buffer.from(key, 'utf16le');
  // 在 buf 中搜索 keyBytes（允许前面有 origin 前缀）
  for (let i = 0; i <= buf.length - keyBytes.length; i++) {
    if (buf[i] === keyBytes[0] && buf[i + 1] === keyBytes[1]) {
      let match = true;
      for (let j = 0; j < keyBytes.length; j++) {
        if (buf[i + j] !== keyBytes[j]) { match = false; break; }
      }
      if (match) return i + keyBytes.length;
    }
  }
  return -1;
}

// 从 value 起点提取 JSON（UTF-16LE，跳过可能的长度/类型字节）
function extractJSON(buf, startPos) {
  // 跳过 0-8 个前导字节（LevelDB 格式：长度前缀/类型标记）
  for (let skip = 0; skip <= 16; skip++) {
    const tryStart = startPos + skip;
    if (tryStart + 2 > buf.length) break;
    // 检查是不是 { (0x7B 0x00 在 UTF-16LE 里)
    if (buf[tryStart] === 0x7B && buf[tryStart + 1] === 0x00) {
      const u16 = buf.toString('utf16le', tryStart, Math.min(buf.length, tryStart + 100000));
      const start = u16.indexOf('{');
      if (start < 0) continue;
      let depth = 0, end = -1;
      for (let i = start; i < u16.length; i++) {
        if (u16[i] === '{') depth++;
        if (u16[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      if (end > 0) {
        try {
          const parsed = JSON.parse(u16.slice(start, end));
          return parsed;
        } catch(e) {}
      }
    }
  }
  return undefined;
}

const targets = ['cg_track', 'cg_track_today', 'cg_sleep', 'cg_splits', 'cg_todos', 'cg_ddls', 'cg_water', 'cg_focus', 'cg_projects', 'cg_schedule', 'cg_courses_v2'];

console.log('=== v4 字节级提取 ===\n');
const results = {};

files.forEach(f => {
  const buf = fs.readFileSync(path.join(lsDir, f));
  targets.forEach(t => {
    if (results[t]) return; // 已提取
    const valStart = findKeyValue(buf, t);
    if (valStart < 0) return;
    const parsed = extractJSON(buf, valStart);
    if (parsed !== undefined) {
      results[t] = parsed;
      const s = JSON.stringify(parsed);
      console.log('✅', t, '←', f, '|', s.length, '字符');
      if (Array.isArray(parsed)) console.log('   数组:', parsed.length, '项 | 首项:', JSON.stringify(parsed[0]).slice(0, 100));
    }
  });
});

// 合并到服务器
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
