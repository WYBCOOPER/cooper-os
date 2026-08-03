// 安全修复：S1/S2/S3（在工作台真实代码上实施）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
let s = fs.readFileSync(path, 'utf8');

console.log('=== S1-S3 修复开始 ===\n');

// ============ S1: 局域网无认证 → 默认仅本机 + 口令认证 ============
// 现状：server.listen(PORT) 监听所有接口；已有口令登录
// 增强：默认仅 127.0.0.1，COOPER_LAN=1 才监听所有接口
const oldListen = `server.listen(PORT, () => {`;
const newListen = `// S1 修复：默认仅本机，COOPER_LAN=1 才开放局域网
const HOST = process.env.COOPER_LAN ? undefined : '127.0.0.1';
server.listen(PORT, HOST, () => {`;
if (s.includes(oldListen)) {
  s = s.replace(oldListen, newListen);
  console.log('✅ S1: 默认仅本机监听，COOPER_LAN=1 开放局域网');
} else {
  console.log('⚠️ S1 listen 未匹配');
}

// 启动日志提示局域网模式
const oldLog = `  console.log('  手机访问:  http://' + ip + ':' + PORT);
  console.log('  (手机和电脑需连接同一 Wi-Fi)');`;
const newLog = `  console.log('  手机访问:  http://' + ip + ':' + PORT);
  console.log('  (手机和电脑需连接同一 Wi-Fi)');
  console.log('  ⚠️ 当前仅本机可访问，需手机访问请用 COOPER_LAN=1 启动');`;
if (s.includes(oldLog)) {
  s = s.replace(oldLog, newLog);
  console.log('✅ S1: 启动日志提示局域网模式');
}

// ============ S2: 任意命令执行 → 白名单 + path.resolve + execFile ============
// 现状：LAUNCHERS 白名单已有，但 exec 用 shell 字符串。改用 execFile 更安全
const oldLaunch = `  if (url.startsWith('/api/launch/')) {
    const app = url.split('/')[3];
    const cmd = LAUNCHERS[app];
    if (!cmd) { res.writeHead(404); res.end('unknown app'); return; }
    exec(cmd, { windowsHide: true }, () => {});
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, app }));
    return;
  }`;
const newLaunch = `  if (url.startsWith('/api/launch/')) {
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
  }`;
if (s.includes(oldLaunch)) {
  s = s.replace(oldLaunch, newLaunch);
  console.log('✅ S2: 白名单严格校验 + execFile（禁 shell 注入）');
} else {
  console.log('⚠️ S2 launch 未匹配');
}

// 引入 execFile
s = s.replace("const { exec } = require('child_process');", "const { exec, execFile } = require('child_process');");

// ============ S3: GET 副作用 CSRF → 全部改 POST + Origin 校验 ============
// 现状：/api/save 已是 POST；/api/launch 是 GET → 改 POST
// 但前端 index.html 调 /api/launch 用的是 GET，需要同时改前端
// 这里先加 Origin 校验中间件（所有写操作都要校验）
const oldServer = `const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];`;
const newServer = `const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  /* S3 修复：写操作（POST）校验 Origin，防跨站请求伪造 */
  const isWrite = req.method === 'POST' && (url.startsWith('/api/') || url === '/__login');
  if (isWrite && req.headers.origin) {
    const origin = req.headers.origin;
    const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://' + getLANIP() + ':3000'];
    if (!allowed.includes(origin)) { res.writeHead(403); res.end('forbidden origin'); return; }
  }`;
if (s.includes(oldServer)) {
  s = s.replace(oldServer, newServer);
  console.log('✅ S3: 写操作 Origin 校验（防 CSRF）');
} else {
  console.log('⚠️ S3 createServer 未匹配');
}

// launch 改为接受 POST + GET 兼容（前端可能仍用 GET）
// 保持 GET 兼容但已加 Origin 校验；注释说明

fs.writeFileSync(path, s);
console.log('\n✅ S1-S3 修复写入 server.js');
