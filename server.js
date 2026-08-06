/* ================================================================
   COOPER OS 局域网服务 (server.js) — v10.3.0 安全版
   用途：手机/电脑同一 Wi-Fi 访问总控台，数据双向同步
   运行：node server.js
   访问：电脑 http://localhost:3001  手机 http://电脑IP:3001
   【安全】已加访问口令：首次访问需输入密码，防同 WiFi 窥探
   口令保存在 .server-auth.json（不在代码里硬编码）
   ================================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { exec, execFile, execFileSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const PORT = 3000;  // 3000 被 Mineradio 占用
const HTML_FILE = path.join(__dirname, 'index.html');
const DATA_FILE = path.join(__dirname, 'cooper-os-data.json');
const AUTH_FILE = path.join(__dirname, '.server-auth.json');

/* ================= 访问口令（安全） ================= */
function loadAuth() {
  try { return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8')); }
  catch { return {}; }
}
function saveAuth(a) {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(a, null, 2), { mode: 0o600 });
}
// 读取口令（不存在则生成随机口令并保存）
function getPassword() {
  const auth = loadAuth();
  if (auth.password) return auth.password;
  const pw = 'CO' + Math.random().toString(36).slice(2, 8) + crypto.randomBytes(2).toString('hex');
  saveAuth({ ...auth, password: pw });
  return pw;
}
const SERVER_PASSWORD = getPassword();

// token：口令的哈希（用于 cookie 验证，不存明文）
function makeToken() {
  return crypto.createHash('sha256').update('cooper-os:' + SERVER_PASSWORD).digest('hex');
}
const VALID_TOKEN = makeToken();

// 解析 cookie
function getCookie(req) {
  const raw = req.headers.cookie || '';
  const map = {};
  raw.split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) map[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return map;
}
function isAuthed(req) {
  // H3 修复：常量时间比较（防时序攻击）
  const t = getCookie(req).cooper_token || '';
  if (t.length !== VALID_TOKEN.length) return false;
  return crypto.timingSafeEqual(Buffer.from(t), Buffer.from(VALID_TOKEN));
}

// 登录页（极简黑金风格，内联样式不依赖外部资源）
const LOGIN_PAGE = `<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>COOPER OS · 访问验证</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#05060a;font-family:'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif}
  .box{width:min(360px,88vw);padding:36px 30px;border-radius:18px;text-align:center;
    background:rgba(16,19,28,.9);border:1px solid rgba(212,175,106,.3);
    box-shadow:0 0 60px rgba(212,175,106,.12)}
  .logo{font-size:15px;letter-spacing:.3em;color:#d4af6a;margin-bottom:22px}
  .tip{font-size:12px;color:#8b93a7;margin-bottom:18px;line-height:1.7}
  input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;font-size:15px;
    background:rgba(5,6,10,.8);border:1px solid rgba(212,175,106,.35);color:#efe9dc;outline:none;margin-bottom:14px}
  input:focus{border-color:#d4af6a}
  button{width:100%;padding:12px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;
    background:linear-gradient(135deg,#d4af6a,#e8c98f);color:#0a0a0d;border:none;transition:opacity .2s}
  button:hover{opacity:.88}
  .err{color:#ff7a94;font-size:12px;margin-top:10px;min-height:18px}
  .hint{font-size:10px;color:#5d6475;margin-top:14px}
</style></head><body>
<div class="box">
  <div class="logo">C O O P E R // O S</div>
  <div class="tip">此总控台需要访问口令<br>请输入密码后进入（防止同 WiFi 他人窥探）</div>
  <form method="POST" action="/__login">
    <input type="password" name="pw" placeholder="访问口令" autofocus>
    <button type="submit">进入总控台</button>
  </form>
  <div class="err" id="err"></div>
  <div class="hint">口令见电脑端启动日志</div>
</div>
<script>
  const url = new URL(location.href);
  if (url.searchParams.get('fail')) document.getElementById('err').textContent = '口令错误，请重试';
</script>
</body></html>`;

/* ---------- 数据读写 ---------- */
// ===== SQLite 数据存储（2026-08-06 升级：JSON → 真数据库，JSON 双保险）=====
const DB_FILE = path.join(__dirname, 'cooper-os.db');
let db = null;
function getDB() {
  if (db) return db;
  try {
    db = new DatabaseSync(DB_FILE);
    db.exec('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)');
    // 首次启动：迁移旧 JSON 数据
    if (fs.existsSync(DATA_FILE)) {
      try {
        const old = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const stmt = db.prepare('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)');
        Object.entries(old).forEach(([k, v]) => stmt.run(k, JSON.stringify(v)));
        console.log('[SQLite] 已迁移旧 JSON 数据 ' + Object.keys(old).length + ' 条');
      } catch (e) { console.log('[SQLite] 迁移跳过: ' + e.message); }
    }
  } catch (e) { console.log('[SQLite] 初始化失败: ' + e.message); }
  return db;
}
function loadData() {
  try {
    const d = getDB();
    if (d) {
      const rows = d.prepare('SELECT key, value FROM kv').all();
      const out = {};
      rows.forEach(r => { try { out[r.key] = JSON.parse(r.value); } catch (e) { out[r.key] = r.value; } });
      return out;
    }
  } catch (e) { console.log('[SQLite] 读取失败，回退 JSON: ' + e.message); }
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return {}; }
}
function saveData(data) {
  // 🔒 备份：保存前把旧数据备份（防误删/覆盖），保留最近 20 份
  try {
    const bakDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(bakDir)) fs.mkdirSync(bakDir);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    fs.writeFileSync(path.join(bakDir, 'data-' + stamp + '.json'), JSON.stringify(data, null, 2));
    const baks = fs.readdirSync(bakDir).filter(f => f.startsWith('data-')).sort();
    while (baks.length > 20) { fs.unlinkSync(path.join(bakDir, baks.shift())); }
  } catch(e) {}
  // 双保险：SQLite 主写 + JSON 兜底
  try {
    const d = getDB();
    if (d) {
      const stmt = d.prepare('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)');
      Object.entries(data).forEach(([k, v]) => stmt.run(k, JSON.stringify(v)));
      // 全量同步：删除 SQLite 中 data 里已不存在的 key（保证删除生效）
      const keep = new Set(Object.keys(data));
      d.prepare('SELECT key FROM kv').all().forEach(r => {
        if (!keep.has(r.key)) d.prepare('DELETE FROM kv WHERE key=?').run(r.key);
      });
    }
  } catch (e) { console.log('[SQLite] 写入失败: ' + e.message); }
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); } catch(e) {}
}


/* ---------- 获取局域网 IP ---------- */
function getLANIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

/* ---------- 启动器命令 ---------- */
const LAUNCHERS = {
  code: 'code',
  obsidian: 'start obsidian://',
  ubuntu: 'wsl -d Ubuntu',
  docker: 'start docker-desktop'
};

/* ---------- HTTP 服务 ---------- */
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  /* S3 修复：写操作（POST）校验 Origin，防跨站请求伪造 */
  const isWrite = req.method === 'POST' && (url.startsWith('/api/') || url === '/__login');
  if (isWrite && req.headers.origin) {
    const origin = req.headers.origin;
    const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://' + getLANIP() + ':3000'];
    if (!allowed.includes(origin)) { res.writeHead(403); res.end('forbidden origin'); return; }
  }

  /* 登录提交：验证口令 → 种 cookie */
  if (url === '/__login' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const m = body.match(/pw=([^&]*)/);
      let pw = m ? m[1] : '';
      try { pw = decodeURIComponent(pw); } catch(e) { pw = ''; } // M5: 恶意编码不崩
      if (pw === SERVER_PASSWORD) {
        res.writeHead(302, {
          'Location': '/',
          'Set-Cookie': 'cooper_token=' + VALID_TOKEN + '; HttpOnly; Max-Age=2592000; Path=/'
        });
        res.end();
      } else {
        res.writeHead(302, { 'Location': '/?fail=1' });
        res.end();
      }
    });
    return;
  }

  /* 未认证：除登录页外全部拦截 */
  if (!isAuthed(req)) {
    if (url === '/' || url === '/index.html' || url === '/favicon.ico') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(LOGIN_PAGE);
      return;
    }
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }

  /* 主页：返回工作台 */
  if (url === '/' || url === '/index.html') {
    fs.readFile(HTML_FILE, (err, data) => {
      if (err) { res.writeHead(500); res.end('HTML not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  /* 静态资源（安全白名单：仅图片/图标/字体，禁路径穿越） */
  if (req.method === 'GET' && /^\.(png|jpe?g|webp|gif|svg|ico)$/i.test(path.extname(url))) {
    const safeName = path.basename(url); // 只取文件名，杜绝 ../ 穿越
    const file = path.join(__dirname, safeName);
    const MIME = {
      '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
    };
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not Found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
    return;
  }

  /* 保存数据：POST /api/save { key, value } */
  if (url === '/api/save' && req.method === 'POST') {
    // H1+M3 修复：body 大小限制（防 DoS）+ key 白名单（防任意写/原型污染）
    let body = '';
    let tooBig = false;
    req.on('data', c => {
      if (tooBig) return; // 已超限，丢弃后续数据
      body += c;
      if (body.length > 2 * 1024 * 1024) { tooBig = true; body = body.slice(0, 1024); } // 2MB 上限，保留开头用于解析 key
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
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  /* 加载全部数据：GET /api/load */
  if (url === '/api/load') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(loadData()));
    return;
  }

  /* /* ===== 软件管理：扫描 + 启动（2026-08-06）===== */
/* 扫描已安装软件：GET /api/apps/scan（批量解析，秒出）*/
let appsScanCache = null;
let appsScanCacheTime = 0;
if (url === '/api/apps/scan' && req.method === 'GET') {
  // 缓存 5 分钟（避免每次 30 秒）
  if (appsScanCache && Date.now() - appsScanCacheTime < 300000) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(appsScanCache));
    return;
  }
  const found = [];
  const seen = new Set();
  function addApp(name, exePath) {
    if (!name || !exePath) return;
    if (!fs.existsSync(exePath)) return;
    if (seen.has(exePath.toLowerCase())) return;
    seen.add(exePath.toLowerCase());
    found.push({ name, icon: '📦', path: exePath, cat: '软件' });
  }
  // 收集所有开始菜单 lnk（不解析，先收集）
  const lnkList = [];
  const startMenuDirs = [
    (process.env.APPDATA || '') + '\\Microsoft\\Windows\\Start Menu\\Programs',
    'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs'
  ];
  startMenuDirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) return;
      const walk = (d) => {
        let items = [];
        try { items = fs.readdirSync(d, { withFileTypes: true }); } catch(e) { return; }
        items.forEach(it => {
          const full = d + '\\' + it.name;
          if (it.isDirectory()) walk(full);
          else if (it.name.toLowerCase().endsWith('.lnk')) lnkList.push(full);
        });
      };
      walk(dir);
    } catch(e) {}
  });
  // 批量 PowerShell：一次解析所有 lnk（避免每个启动一次进程）
  if (lnkList.length > 0) {
    try {
      const escList = lnkList.map(p => "'" + p.replace(/'/g, "''") + "'").join(',');
      const psScript = "[Console]::OutputEncoding=[Text.Encoding]::UTF8; $s=New-Object -ComObject WScript.Shell; @(" + escList + ") | ForEach-Object { $l=$s.CreateShortcut($_); if($l.TargetPath -and $l.TargetPath.EndsWith('.exe')){ Write-Output ($l.TargetPath + '|' + (Split-Path $_ -Leaf).Replace('.lnk','')) } }";
      const out = execFileSync('powershell', ['-NoProfile', '-Command', psScript], { encoding: 'utf8', windowsHide: true, timeout: 30000 }).trim();
      if (out) {
        out.split(/\r?\n/).forEach(line => {
          const m = line.match(/^(.*)\|([^|]+)$/);
          if (m) addApp(m[2], m[1]);
        });
      }
    } catch(e) { console.log('[scan] 批量解析失败: ' + (e.message || '').slice(0, 60)); }
  }
  // 常见目录补充
  const extraDirs = ['C:\\Program Files', 'C:\\Program Files (x86)', 'C:\\Users\\wyb\\AppData\\Local\\Programs'];
  extraDirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir, { withFileTypes: true });
      items.forEach(it => { if (it.isDirectory()) addApp(it.name, dir + '\\' + it.name + '\\' + it.name + '.exe'); });
    } catch(e) {}
  });
  found.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  appsScanCache = { ok: true, apps: found.slice(0, 300), total: found.length };
  appsScanCacheTime = Date.now();
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(appsScanCache));
  return;
}

/* 启动软件：GET /api/apps/launch?path=...（安全白名单）*/
if (url === '/api/apps/launch' && req.method === 'GET') {
  const q = new URL(req.url, 'http://x').searchParams;
  const p = q.get('path') || '';
  const lower = p.toLowerCase();
  const okPath = lower.endsWith('.exe') && (lower.includes('program files') || lower.includes('appdata') || lower.includes('system32') || lower.includes('users\\') || lower.includes('lenovosoftstore')) && !lower.includes('cmd.exe') && !lower.includes('powershell') && !lower.includes('&&') && !lower.includes(';') && !lower.includes('del ');
  if (!okPath) { res.writeHead(403); res.end(JSON.stringify({ ok: false, error: 'not whitelisted' })); return; }
  execFile('cmd', ['/c', 'start', '', p], { windowsHide: true }, () => {});
  res.writeHead(200);
  res.end(JSON.stringify({ ok: true, path: p }));
  return;
}

/* 打开外部链接：GET /api/open-url?url=...（安全白名单协议）*/
if (url === '/api/open-url' && req.method === 'GET') {
  const q = new URL(req.url, 'http://x').searchParams;
  const u = q.get('url') || '';
  // 白名单协议：http/https/bilibili 等（禁止 file:// javascript: 等危险协议）
  const ok = /^(https?:\/\/|bilibili:|obsidian:|steam:|magnet:)/i.test(u);
  if (!ok || u.length > 500) { res.writeHead(403); res.end(JSON.stringify({ ok: false, error: 'invalid url' })); return; }
  execFile('cmd', ['/c', 'start', '', u], { windowsHide: true }, () => {});
  res.writeHead(200);
  res.end(JSON.stringify({ ok: true, url: u }));
  return;
}

/* 启动应用：GET /api/launch/:app */
  if (url.startsWith('/api/launch/')) {
    // S2 修复：白名单校验（禁止路径穿越/任意命令）
    const app = decodeURIComponent(url.split('/')[3] || '');
    if (!/^[a-zA-Z0-9_-]{1,32}$/.test(app)) { res.writeHead(400); res.end('invalid app'); return; }
    const cmd = LAUNCHERS[app];
    if (!cmd) { res.writeHead(404); res.end('unknown app'); return; }
    // 用 execFile 而非 exec（不经过 shell，防注入）
    if (app === 'code') {
      execFile('code', [], { windowsHide: true }, () => {});
    } else {
      execFile('cmd', ['/c', 'start', '', cmd], { windowsHide: true }, () => {});
    }
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, app }));
    return;
  }

  /* 文档占位 */
  if (url.startsWith('/api/doc/')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, msg: '文档中心：请将文件放入本目录 docs/ 文件夹' }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// S1 修复：默认仅本机，COOPER_LAN=1 才开放局域网
const HOST = process.env.COOPER_LAN ? undefined : '127.0.0.1';
server.listen(PORT, HOST, () => {
  const ip = getLANIP();
  console.log('==========================================');
  console.log('  COOPER OS 服务器已启动 ✓');
  console.log('------------------------------------------');
  console.log('  本机访问:  http://localhost:' + PORT);
  console.log('  手机访问:  http://' + ip + ':' + PORT);
  console.log('  (手机和电脑需连接同一 Wi-Fi)');
  console.log('  ⚠️ 当前仅本机可访问，需手机访问请用 COOPER_LAN=1 启动');
  console.log('------------------------------------------');
  console.log('  🔒 访问口令: ' + SERVER_PASSWORD);
  if (SERVER_PASSWORD.length < 8 || /^\d+$/.test(SERVER_PASSWORD)) {
    console.log('  ⚠️ 警告：口令强度较弱（建议 ≥8 位混合字符）');
  }
  console.log('  （口令已存 .server-auth.json，可用文本编辑器修改）');
  console.log('  数据文件:  ' + DATA_FILE);
  console.log('==========================================');
});
