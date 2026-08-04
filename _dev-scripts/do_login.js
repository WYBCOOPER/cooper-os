// 登录 COOPER OS 并截图（用 Edge headless 带 cookie）
const { execSync } = require('child_process');
const fs = require('fs');
const http = require('http');

// 1. 先用 http 请求登录拿 cookie
function login() {
  return new Promise((resolve, reject) => {
    const body = 'pw=1905';
    const req = http.request({
      host: 'localhost', port: 3000, path: '/__login', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      const cookies = (res.headers['set-cookie'] || []).join('; ');
      resolve(cookies);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const cookies = await login();
  console.log('登录成功，cookie: ' + cookies.slice(0, 60) + '...');
  fs.writeFileSync('_dev-scripts/cookies.txt', cookies);
  console.log('✅ cookie 已保存');
})();
