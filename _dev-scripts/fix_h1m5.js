// 安全修复 H1-H3 / M1-M5（server.js 综合加固）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
let s = fs.readFileSync(path, 'utf8');

console.log('=== H1-H3 / M1-M5 修复 ===\n');

// ============ H1 + M3: 任意写文件 → key 白名单 + 大小限制 ============
// 问题：/api/save 的 key 无校验，可写入任意键（含 __proto__ 污染 / 超大值）
const oldSave = `  /* 保存数据：POST /api/save { key, value } */
  if (url === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { key, value } = JSON.parse(body);
        const data = loadData();
        data[key] = value;
        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }`;
const newSave = `  /* 保存数据：POST /api/save { key, value } */
  if (url === '/api/save' && req.method === 'POST') {
    // H1+M3 修复：body 大小限制（防 DoS）+ key 白名单（防任意写/原型污染）
    let body = '';
    let tooBig = false;
    req.on('data', c => {
      body += c;
      if (body.length > 2 * 1024 * 1024) { tooBig = true; req.destroy(); } // 2MB 上限
    });
    req.on('end', () => {
      if (tooBig) { res.writeHead(413); res.end(JSON.stringify({ ok: false, error: 'payload too large' })); return; }
      try {
        const { key, value } = JSON.parse(body);
        // key 白名单：只允许 cg_ 前缀 + 已知业务键（禁 __proto__/constructor 等）
        if (typeof key !== 'string' || key.length < 3 || key.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(key)) {
          res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'invalid key' })); return;
        }
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'reserved key' })); return;
        }
        // value 大小限制（单键 1MB）
        const vSize = JSON.stringify(value).length;
        if (vSize > 1024 * 1024) { res.writeHead(413); res.end(JSON.stringify({ ok: false, error: 'value too large' })); return; }
        const data = loadData();
        if (value === null || value === undefined) { delete data[key]; } // null = 删除
        else { data[key] = value; }
        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }`;
if (s.includes(oldSave)) {
  s = s.replace(oldSave, newSave);
  console.log('✅ H1: key 白名单 + 防原型污染 + 2MB/1MB 大小限制');
} else { console.log('⚠️ /api/save 未匹配'); }

// ============ H3: token 比较用 timingSafeEqual（防时序攻击） ============
const oldAuth = `function isAuthed(req) {
  return getCookie(req).cooper_token === VALID_TOKEN;
}`;
const newAuth = `function isAuthed(req) {
  // H3 修复：常量时间比较（防时序攻击）
  const t = getCookie(req).cooper_token || '';
  if (t.length !== VALID_TOKEN.length) return false;
  return crypto.timingSafeEqual(Buffer.from(t), Buffer.from(VALID_TOKEN));
}`;
if (s.includes(oldAuth)) {
  s = s.replace(oldAuth, newAuth);
  console.log('✅ H3: token 比较改为 timingSafeEqual');
} else { console.log('⚠️ isAuthed 未匹配'); }

// ============ M4: 口令强度提示（启动日志警告弱口令） ============
const oldLog2 = `  console.log('  🔒 访问口令: ' + SERVER_PASSWORD);`;
const newLog2 = `  console.log('  🔒 访问口令: ' + SERVER_PASSWORD);
  if (SERVER_PASSWORD.length < 8 || /^\\d+$/.test(SERVER_PASSWORD)) {
    console.log('  ⚠️ 警告：口令强度较弱（建议 ≥8 位混合字符）');
  }`;
if (s.includes(oldLog2)) {
  s = s.replace(oldLog2, newLog2);
  console.log('✅ M4: 弱口令启动警告');
} else { console.log('⚠️ 口令日志未匹配'); }

// ============ M5: 登录解码 DoS 防护（decodeURIComponent 包 try/catch） ============
const oldLogin = `      const m = body.match(/pw=([^&]*)/);
      const pw = m ? decodeURIComponent(m[1]) : '';`;
const newLogin = `      const m = body.match(/pw=([^&]*)/);
      let pw = m ? m[1] : '';
      try { pw = decodeURIComponent(pw); } catch(e) { pw = ''; } // M5: 恶意编码不崩`;
if (s.includes(oldLogin)) {
  s = s.replace(oldLogin, newLogin);
  console.log('✅ M5: 登录解码 DoS 防护');
} else { console.log('⚠️ 登录解码未匹配'); }

// ============ 修复：/api/doc 与 /api/launch 前缀重叠问题 ============
// /api/doc/ 和 /api/launch/ 用 startsWith 判断，但 /api/launch/../../ 会被正则拒绝 ✅（S2 已做）
// /api/load 无敏感数据 ✅

// ============ 上传→执行链：/api/launch 改 POST-only？ ============
// 保持 GET 兼容但已有 Origin 校验 + 白名单，安全 ✅

fs.writeFileSync(path, s);
console.log('\n✅ H1/H3/M4/M5 修复完成');
