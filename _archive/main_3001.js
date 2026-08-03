/* COOPER OS Electron 主进程 — 把总控台打包成独立 exe */
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

/* ---------- 内置局域网服务（让 exe 也支持手机访问） ---------- */
const PORT = 3001;  // 3000 被 Mineradio 占用，改用 3001
const DATA_FILE = path.join(app.getPath('userData'), 'cooper-os-data.json');
const HTML_FILE = path.join(__dirname, 'index.html');

function loadData() { try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return {}; } }
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }
function getLANIP() {
  const nets = os.networkInterfaces();
  for (const n of Object.keys(nets)) for (const net of nets[n]) if (net.family === 'IPv4' && !net.internal) return net.address;
  return '127.0.0.1';
}
const LAUNCHERS = { code: 'code', obsidian: 'start obsidian://', ubuntu: 'wsl -d Ubuntu', docker: 'start docker-desktop' };

/* ---------- Obsidian 知识库路径 ---------- */
const OBSIDIAN_DIR = path.join(os.homedir(), 'Obsidian', '草哥的知识库');
// 注意：便携版 exe 里 __dirname 是 asar 只读路径，可变数据放 userData
const USER_DATA = app.getPath('userData');
const DOCS_DIR = path.join(USER_DATA, 'docs');
const INBOX_DIR = path.join(USER_DATA, 'inbox');
try { if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true }); } catch {}
try { if (!fs.existsSync(INBOX_DIR)) fs.mkdirSync(INBOX_DIR, { recursive: true }); } catch {}

/* 扫描目录树（md 文件） */
function scanMd(dir, base, depth) {
  if (depth > 3) return [];
  const out = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      if (it.name.startsWith('.')) continue;
      const full = path.join(dir, it.name);
      const rel = path.join(base || '', it.name);
      if (it.isDirectory()) out.push(...scanMd(full, rel, depth + 1));
      else if (it.name.endsWith('.md')) out.push({ name: it.name, path: rel.split(path.sep).join('/'), dir: (base || '').split(path.sep).join('/') });
    }
  } catch {}
  return out;
}

/* 打开文件/目录（用系统默认程序） */
function openWithDefault(p) {
  exec('start "" "' + p + '"', { windowsHide: true }, () => {});
}

/* 简易 multipart/form-data 解析（用于文件上传） */
function splitMultipart(buf, boundary) {
  const b = Buffer.from('--' + boundary);
  const parts = [];
  let pos = 0;
  while (true) {
    const start = buf.indexOf(b, pos);
    if (start < 0) break;
    const after = start + b.length;
    // 检查结束边界
    if (buf.slice(after, after + 2).toString() === '--') break;
    const next = buf.indexOf(b, after);
    const end = next > 0 ? next : buf.length - 2;
    const part = buf.slice(after + 2, end); // 跳过 \r\n
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd < 0) { pos = after; continue; }
    const header = part.slice(0, headerEnd).toString();
    const data = part.slice(headerEnd + 4);
    if (data.length >= 2 && data[data.length-2] === 13 && data[data.length-1] === 10) data.subarray(0, data.length - 2);
    const filename = header.match(/filename="([^"]*)"/)?.[1] || null;
    if (filename) parts.push({ filename, data: data.subarray(0, data.length - (data.length>=2 && data[data.length-2]===13 ? 2 : 0)) });
    pos = after;
  }
  return parts;
}

/* 从 openclaw.json 读取 gateway token */
function getToken() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.openclaw', 'openclaw.json'), 'utf8'));
    return cfg.gateway && cfg.gateway.auth && cfg.gateway.auth.token ? cfg.gateway.auth.token : null;
  } catch { return null; }
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/') {
    fs.readFile(HTML_FILE, (err, data) => {
      if (err) { res.writeHead(500); res.end('HTML not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
  }
  if (url === '/manifest.json') { res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-cache'}); res.end(fs.readFileSync(path.join(__dirname,'manifest.json'))); return; }
  if (url === '/sw.js') { res.writeHead(200, {'Content-Type':'application/javascript','Cache-Control':'no-cache'}); res.end(fs.readFileSync(path.join(__dirname,'sw.js'))); return; }
  if (url === '/icon-192.png') { res.writeHead(200, {'Content-Type':'image/png'}); res.end(fs.readFileSync(path.join(__dirname,'icon-192.png'))); return; }
  if (url === '/icon-512.png') { res.writeHead(200, {'Content-Type':'image/png'}); res.end(fs.readFileSync(path.join(__dirname,'icon-512.png'))); return; }
  if (url === '/api/save' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try { const { key, value } = JSON.parse(b); const d = loadData(); d[key] = value; saveData(d); res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify({ok:true})); }
      catch (e) { res.writeHead(400); res.end(JSON.stringify({ok:false})); }
    });
    return;
  }
  if (url === '/api/load') { res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify(loadData())); return; }
  /* 聊天转发：浏览器无 token，由本进程带 token 转发到 OpenClaw */
  if (url === '/api/chat' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const token = getToken();
        if (!token) { res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify({error:{message:'未找到 OpenClaw token'}})); return; }
        const opts = { host:'127.0.0.1', port:18789, path:'/v1/chat/completions', method:'POST', headers:{ 'Authorization':'Bearer '+token, 'Content-Type':'application/json', 'Content-Length':Buffer.byteLength(b) } };
        const r = http.request(opts, r2 => { let bb=''; r2.on('data',c=>bb+=c); r2.on('end',()=>{ res.writeHead(200,{'Content-Type':'application/json'}); res.end(bb); }); });
        r.on('error', () => { res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({error:{message:'OpenClaw 未运行'}})); });
        r.write(b); r.end();
      } catch (e) { res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({error:{message:e.message}})); }
    });
    return;
  }
  if (url.startsWith('/api/launch/')) {
    const app2 = url.split('/')[3];
    const cmd = LAUNCHERS[app2];
    if (cmd) exec(cmd, { windowsHide: true }, () => {});
    res.writeHead(200); res.end(JSON.stringify({ok:true}));
    return;
  }

  /* 搜索转发：用系统浏览器打开 Bing */
  if (url === '/api/search' || url.startsWith('/api/search?')) {
    const qs = new URL(req.url, 'http://x').searchParams;
    const q = qs.get('q') || '';
    if (q) shell.openExternal('https://www.bing.com/search?q=' + encodeURIComponent(q));
    res.writeHead(200); res.end(JSON.stringify({ok:true}));
    return;
  }

  /* 打开网址：用系统浏览器 */
  if (url === '/api/open-url' || url.startsWith('/api/open-url?')) {
    const qs = new URL(req.url, 'http://x').searchParams;
    const u = qs.get('url') || '';
    if (u) {
      // B站链接：直接用客户端 exe 启动（协议可能未注册）
      if (u.startsWith('bilibili://') || u.includes('bilibili.com')) {
        const BILI_EXE = 'C:\\Program Files\\bilibili\\哔哩哔哩.exe';
        if (fs.existsSync(BILI_EXE)) {
          exec('"' + BILI_EXE + '" "' + u + '"', { windowsHide: true }, () => {});
        } else {
          shell.openExternal(u);
        }
      } else {
        shell.openExternal(u);
      }
    }
    res.writeHead(200); res.end(JSON.stringify({ok:true}));
    return;
  }

  /* 列出 Obsidian 知识库 md 文件 */
  if (url === '/api/obsidian/list') {
    const files = scanMd(OBSIDIAN_DIR, '', 0);
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ ok: true, dir: OBSIDIAN_DIR, files }));
    return;
  }

  /* 读取 Obsidian 笔记内容：GET /api/obsidian/read?path=xxx */
  if (url === '/api/obsidian/read' || url.startsWith('/api/obsidian/read?')) {
    const qs = new URL(req.url, 'http://x').searchParams;
    const rel = (qs.get('path') || '').split('/').join(path.sep);
    const full = path.join(OBSIDIAN_DIR, rel);
    try {
      if (!full.startsWith(OBSIDIAN_DIR)) throw new Error('越界');
      const content = fs.readFileSync(full, 'utf8');
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ ok: true, content }));
    } catch (e) {
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  /* 用 Obsidian 打开笔记：GET /api/obsidian/open?path=xxx */
  if (url === '/api/obsidian/open' || url.startsWith('/api/obsidian/open?')) {
    const qs = new URL(req.url, 'http://x').searchParams;
    const rel = (qs.get('path') || '').split('/').join(path.sep);
    const full = path.join(OBSIDIAN_DIR, rel);
    try {
      if (!full.startsWith(OBSIDIAN_DIR)) throw new Error('越界');
      shell.openExternal('obsidian://open?vault=' + encodeURIComponent('草哥的知识库') + '&file=' + encodeURIComponent(rel.replace(/\.md$/, '')));
      res.writeHead(200); res.end(JSON.stringify({ok:true}));
    } catch (e) { res.writeHead(200); res.end(JSON.stringify({ok:false, error:e.message})); }
    return;
  }

  /* 工作台日记 → 写入 Obsidian 05-日记：POST /api/journal/sync */
  if (url === '/api/journal/sync' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const { date, title, content } = JSON.parse(b);
        const diaryDir = path.join(OBSIDIAN_DIR, '05-日记');
        if (!fs.existsSync(diaryDir)) fs.mkdirSync(diaryDir, { recursive: true });
        const file = path.join(diaryDir, date + '.md');
        fs.writeFileSync(file, content, 'utf8');
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ ok: true, file }));
      } catch (e) {
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  /* 列出 docs 文件夹文件 */
  if (url === '/api/docs/list') {
    const files = [];
    try {
      if (fs.existsSync(DOCS_DIR)) {
        const items = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
        for (const it of items) {
          if (it.isFile()) files.push({ name: it.name, size: fs.statSync(path.join(DOCS_DIR, it.name)).size });
        }
      }
    } catch {}
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ ok: true, files }));
    return;
  }

  /* 最近文档：扫描 文档/桌面/下载 的常用文档类型 */
  if (url === '/api/docs/recent') {
    const DOC_EXTS = ['.doc','.docx','.xls','.xlsx','.ppt','.pptx','.pdf','.txt','.md','.csv'];
    const scanDirs = [
      path.join(os.homedir(), 'Documents'),
      path.join(os.homedir(), 'Desktop'),
      path.join(os.homedir(), 'Downloads'),
      path.join(os.homedir(), '桌面'),
      path.join(os.homedir(), '下载'),
    ].filter(d => fs.existsSync(d));
    const out = [];
    const seen = new Set();
    const walk = (dir, depth) => {
      if (depth > 3) return;
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const it of items) {
          if (it.name.startsWith('.')) continue;
          const full = path.join(dir, it.name);
          if (it.isDirectory()) {
            if (it.name === 'node_modules' || it.name === '.git' || it.name === 'AppData') continue;
            walk(full, depth + 1);
          } else {
            const ext = path.extname(it.name).toLowerCase();
            if (DOC_EXTS.includes(ext) && !seen.has(full)) {
              seen.add(full);
              try {
                const st = fs.statSync(full);
                out.push({ name: it.name, path: full, ext: ext.slice(1), size: st.size, mtime: st.mtimeMs });
              } catch {}
            }
          }
        }
      } catch {}
    };
    scanDirs.forEach(d => walk(d, 0));
    out.sort((a,b) => b.mtime - a.mtime);
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ ok: true, files: out.slice(0, 40) }));
    return;
  }

  /* 打开任意本地文件（最近文档用）：GET /api/docs/open-file?path=xxx */
  if (url === '/api/docs/open-file' || url.startsWith('/api/docs/open-file?')) {
    const qs = new URL(req.url, 'http://x').searchParams;
    const p = qs.get('path') || '';
    try {
      if (p && fs.existsSync(p)) openWithDefault(p);
      res.writeHead(200); res.end(JSON.stringify({ok:true}));
    } catch (e) { res.writeHead(200); res.end(JSON.stringify({ok:false, error:e.message})); }
    return;
  }

  /* 打开 docs 文件：GET /api/docs/open?file=xxx */
  if (url === '/api/docs/open' || url.startsWith('/api/docs/open?')) {
    const qs = new URL(req.url, 'http://x').searchParams;
    const name = qs.get('file') || '';
    const full = path.join(DOCS_DIR, name);
    try {
      if (!full.startsWith(DOCS_DIR)) throw new Error('越界');
      if (fs.existsSync(full)) openWithDefault(full);
      res.writeHead(200); res.end(JSON.stringify({ok:true}));
    } catch (e) { res.writeHead(200); res.end(JSON.stringify({ok:false, error:e.message})); }
    return;
  }

  /* ===== 文件传输（手机 ↔ 电脑） ===== */
  /* 文件列表：GET /api/files */
  if (url === '/api/files') {
    const files = [];
    try {
      const items = fs.readdirSync(INBOX_DIR, { withFileTypes: true });
      for (const it of items) {
        if (it.isFile()) {
          const st = fs.statSync(path.join(INBOX_DIR, it.name));
          files.push({ name: it.name, size: st.size, mtime: st.mtime.toISOString() });
        }
      }
    } catch {}
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ ok: true, files }));
    return;
  }

  /* 上传文件：POST /api/upload （multipart 简易解析） */
  if (url === '/api/upload' && req.method === 'POST') {
    const chunks = [];
    let size = 0;
    req.on('data', c => { chunks.push(c); size += c.length; });
    req.on('end', () => {
      try {
        const buf = Buffer.concat(chunks);
        const boundary = req.headers['content-type'].match(/boundary=(.+)$/)?.[1];
        if (!boundary) { res.writeHead(400); res.end(JSON.stringify({ok:false,error:'no boundary'})); return; }
        // 从 multipart body 提取文件名和内容
        const parts = splitMultipart(buf, boundary);
        if (!parts || !parts.length) { res.writeHead(400); res.end(JSON.stringify({ok:false,error:'no parts'})); return; }
        const p = parts[0];
        const fn = p.filename || ('file-' + Date.now());
        const safe = path.basename(fn);
        fs.writeFileSync(path.join(INBOX_DIR, safe), p.data);
        // 收到手机文件 → 电脑通知
        try {
          if (typeof Notification !== 'undefined' && Notification.isSupported()) {
            const notif = new Notification({ title: '📤 收到文件', body: safe + '（' + (p.data.length/1024/1024).toFixed(1) + ' MB）\n已存到 inbox 文件夹' });
            notif.show();
          }
        } catch {}
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ ok: true, name: safe, size: p.data.length }));
      } catch (e) {
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  /* 下载文件：GET /api/files/download?name=xxx */
  if (url === '/api/files/download') {
    const qs = new URL(req.url, 'http://x').searchParams;
    const name = path.basename(qs.get('name') || '');
    const full = path.join(INBOX_DIR, name);
    try {
      if (!full.startsWith(INBOX_DIR) || !fs.existsSync(full)) throw new Error('文件不存在');
      res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename=' + encodeURIComponent(name) });
      fs.createReadStream(full).pipe(res);
    } catch (e) {
      res.writeHead(404); res.end(JSON.stringify({ok:false, error:e.message}));
    }
    return;
  }

  /* 删除文件：GET /api/files/delete?name=xxx */
  if (url === '/api/files/delete') {
    const qs = new URL(req.url, 'http://x').searchParams;
    const name = path.basename(qs.get('name') || '');
    const full = path.join(INBOX_DIR, name);
    try {
      if (full.startsWith(INBOX_DIR) && fs.existsSync(full)) fs.unlinkSync(full);
      res.writeHead(200); res.end(JSON.stringify({ok:true}));
    } catch (e) { res.writeHead(200); res.end(JSON.stringify({ok:false, error:e.message})); }
    return;
  }

  /* 启动任意软件：GET /api/apps/launch?path=xxx&args=yyy */
  if (url === '/api/apps/launch' || url.startsWith('/api/apps/launch?')) {
    const qs = new URL(req.url, 'http://x').searchParams;
    const p = qs.get('path') || '';
    const args = qs.get('args') || '';
    if (p) {
      try {
        const cmd = args ? `start "" "${p}" ${args}` : `start "" "${p}"`;
        exec(cmd, { windowsHide: true }, () => {});
        // 启动外部软件后，把焦点还给主窗口（防止 Electron 输入框失焦）
        setTimeout(() => {
          try { if (MAIN_WIN && !MAIN_WIN.isDestroyed()) { MAIN_WIN.show(); MAIN_WIN.focus(); } } catch(e) {}
        }, 800);
        res.writeHead(200); res.end(JSON.stringify({ok:true}));
      } catch (e) { res.writeHead(200); res.end(JSON.stringify({ok:false, error:e.message})); }
    } else { res.writeHead(200); res.end(JSON.stringify({ok:false, error:'no path'})); }
    return;
  }

  /* 打开文件夹：GET /api/apps/open-folder?path=xxx */
  if (url === '/api/apps/open-folder' || url.startsWith('/api/apps/open-folder?')) {
    const qs = new URL(req.url, 'http://x').searchParams;
    const p = qs.get('path') || '';
    if (p && fs.existsSync(p)) {
      exec(`start "" "${p}"`, { windowsHide: true }, () => {});
      res.writeHead(200); res.end(JSON.stringify({ok:true}));
    } else { res.writeHead(200); res.end(JSON.stringify({ok:false, error:'folder not found'})); }
    return;
  }

  /* 打开 Reasonix 编程助手：GET /api/reasonix（自动启动 serve + 新窗口） */
  if (url === '/api/reasonix') {
    try {
      const { exec: exec2 } = require('child_process');
      exec2('netstat -ano | findstr :8787 | findstr LISTENING', { windowsHide: true }, (err) => {
        if (err) {
          exec2('start "" /min cmd /c "reasonix serve --addr 127.0.0.1:8787 --auth none"', { windowsHide: true }, () => {});
        }
      });
      setTimeout(() => {
        try {
          const rw = new BrowserWindow({
            width: 1000, height: 760, backgroundColor: '#101418',
            autoHideMenuBar: true, title: 'Reasonix 编程助手'
          });
          rw.loadURL('http://127.0.0.1:8787/');
        } catch (e) {}
      }, 1500);
      res.writeHead(200); res.end(JSON.stringify({ok:true}));
    } catch (e) { res.writeHead(200); res.end(JSON.stringify({ok:false, error:e.message})); }
    return;
  }

    /* 打开老师对话窗口：GET /api/teacher（新 Electron 窗口加载 Control UI） */
  if (url === '/api/teacher') {
    try {
      const tw = new BrowserWindow({
        width: 1000, height: 760, backgroundColor: '#101418',
        autoHideMenuBar: true, title: '老师对话'
      });
      tw.loadURL('http://127.0.0.1:18789/');
      tw.webContents.setWindowOpenHandler(({ url: u }) => { shell.openExternal(u); return { action: 'deny' }; });
      res.writeHead(200); res.end(JSON.stringify({ok:true}));
    } catch (e) { res.writeHead(200); res.end(JSON.stringify({ok:false, error:e.message})); }
    return;
  }

  /* 扫描已安装软件：GET /api/apps/scan */
  if (url === '/api/apps/scan') {
    const found = [];
    const seen = new Set();
    const addExe = (name, p, icon) => {
      try {
        if (p && fs.existsSync(p) && !seen.has(p)) { seen.add(p); found.push({ name, path: p, icon: icon || '🔗' }); }
      } catch {}
    };
    // 开始菜单快捷方式
    const scanLnk = (dir) => {
      try {
        if (!fs.existsSync(dir)) return;
        const walk = (d) => {
          const items = fs.readdirSync(d, { withFileTypes: true });
          for (const it of items) {
            if (it.name.startsWith('.')) continue;
            const full = path.join(d, it.name);
            if (it.isDirectory()) walk(full);
            else if (it.name.endsWith('.lnk')) found.push({ name: it.name.replace('.lnk',''), path: full, icon: '🪟', lnk: true });
          }
        };
        walk(dir);
      } catch {}
    };
    scanLnk(path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
    scanLnk(path.join('C:', 'ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
    // 常见安装目录（直接找 exe）
    const common = [
      path.join(process.env.LOCALAPPDATA || '', 'Programs'),
      'C:\\Program Files',
      'C:\\Program Files (x86)',
    ];
    const scanDir = (dir) => {
      try {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const it of items) {
          if (it.name.startsWith('.')) continue;
          const full = path.join(dir, it.name);
          if (it.isDirectory()) {
            try {
              const subs = fs.readdirSync(full);
              const exe = subs.find(s => s.toLowerCase().endsWith('.exe'));
              if (exe) addExe(it.name, path.join(full, exe), '📦');
            } catch {}
          }
        }
      } catch {}
    };
    common.forEach(scanDir);
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ ok: true, apps: found.slice(0, 120) }));
    return;
  }

  res.writeHead(404); res.end('Not Found');
});

/* 端口冲突自动换端口 */
let actualPort = PORT;
function startServer(port, cb) {
  server.once('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.log('端口 ' + port + ' 被占用，改用 ' + (port + 1));
      startServer(port + 1, cb);
    } else {
      throw err;
    }
  });
  server.listen(port, () => {
    actualPort = port;
    console.log('COOPER OS 服务: http://localhost:' + port + ' 手机: http://' + getLANIP() + ':' + port);
    if (cb) cb();
  });
}

/* ---------- 窗口 ---------- */
let MAIN_WIN = null;
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 600,
    backgroundColor: '#04070f',
    icon: path.join(__dirname, 'icon-512.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  // 通过内置服务加载（http:// 协议，聊天才能走 /api/chat）
  win.loadURL('http://127.0.0.1:' + actualPort + '/');
  MAIN_WIN = win;
  // 外部链接用系统浏览器打开
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  return win;
}

app.whenReady().then(() => {
  startServer(PORT, () => {
    createWindow();
  });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  server.close();
  if (process.platform !== 'darwin') app.quit();
});
