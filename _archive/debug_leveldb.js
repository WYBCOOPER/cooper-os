// v7：详细调试提取（打印 key 周围字节）
const fs = require('fs');
const path = require('path');

const lsDir = path.join(process.env.APPDATA, 'cooper-os', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsDir).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

const keyName = 'cg_track';
const keyBuf = Buffer.from(keyName, 'utf16le');

files.forEach(f => {
  const buf = fs.readFileSync(path.join(lsDir, f));
  // 找 key（UTF-16LE）
  for (let i = 0; i <= buf.length - keyBuf.length; i++) {
    if (buf[i] === keyBuf[0] && buf[i+1] === keyBuf[1]) {
      let ok = true;
      for (let j = 0; j < keyBuf.length; j++) {
        if (buf[i+j] !== keyBuf[j]) { ok = false; break; }
      }
      if (ok) {
        console.log('=== 找到 cg_track 于', f, '@', i, '===');
        // 打印 key 后 40 字节（hex）
        const after = buf.slice(i + keyBuf.length, i + keyBuf.length + 40);
        console.log('key 后 hex:', after.toString('hex'));
        console.log('key 后 utf16le:', after.toString('utf16le'));
        console.log('key 后 utf8:', after.toString('utf8'));
        // 尝试不同偏移 utf16le 解析
        for (let skip = 0; skip < 20; skip++) {
          try {
            const u16 = buf.toString('utf16le', i + keyBuf.length + skip, Math.min(buf.length, i + keyBuf.length + skip + 50000));
            const start = u16.search(/[\{\[]/);
            if (start < 0) continue;
            const open = u16[start];
            const close = open === '{' ? '}' : ']';
            let depth = 0, end = -1;
            for (let k = start; k < u16.length; k++) {
              if (u16[k] === open) depth++;
              if (u16[k] === close) { depth--; if (depth === 0) { end = k + 1; break; } }
            }
            if (end > 0) {
              const jsonStr = u16.slice(start, end);
              const parsed = JSON.parse(jsonStr);
              console.log('✅ 解析成功 skip=' + skip, '|', jsonStr.length, '字符');
              console.log('   数组:', Array.isArray(parsed) ? parsed.length + ' 项' : '对象');
              if (Array.isArray(parsed) && parsed.length) console.log('   首项:', JSON.stringify(parsed[0]).slice(0, 200));
              process.exit(0);
            }
          } catch(e) {}
        }
        return;
      }
    }
  }
});
console.log('❌ 未找到');
