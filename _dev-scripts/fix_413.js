// 优化：超大载荷优雅返回 413（不 destroy 连接）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
let s = fs.readFileSync(path, 'utf8');

const old = `    let body = '';
    let tooBig = false;
    req.on('data', c => {
      body += c;
      if (body.length > 2 * 1024 * 1024) { tooBig = true; req.destroy(); } // 2MB 上限
    });
    req.on('end', () => {
      if (tooBig) { res.writeHead(413); res.end(JSON.stringify({ ok: false, error: 'payload too large' })); return; }`;

const newP = `    let body = '';
    let tooBig = false;
    req.on('data', c => {
      if (tooBig) return; // 已超限，丢弃后续数据
      body += c;
      if (body.length > 2 * 1024 * 1024) { tooBig = true; body = body.slice(0, 1024); } // 2MB 上限，保留开头用于解析 key
    });
    req.on('end', () => {
      if (tooBig) { res.writeHead(413); res.end(JSON.stringify({ ok: false, error: 'payload too large' })); return; }`;

if (s.includes(old)) {
  s = s.replace(old, newP);
  console.log('✅ 超大载荷改为优雅 413（不 destroy）');
} else {
  console.log('⚠️ 未匹配');
}

fs.writeFileSync(path, s);
console.log('完成');
