/* ================================================================
   COOPER OS 正/负路径安全测试 (security_test.js)
   用途：发布前自动测试——正常操作 ✅ + 恶意输入不崩溃 ❌→✅
   运行：node security_test.js
   ================================================================ */
const http = require('http');
const path = require('path');

const BASE = 'http://localhost:3000';
let pass = 0, fail = 0;

function check(name, cond, detail) {
  if (cond) { console.log('✅', name); pass++; }
  else { console.log('❌', name, detail || ''); fail++; }
}

// 先登录拿 cookie
function login(pw, cb) {
  const post = http.request(BASE + '/__login', { method: 'POST' }, res => {
    const setCookie = res.headers['set-cookie'] || [];
    cb(setCookie[0] ? setCookie[0].split(';')[0] : '');
  });
  post.end('pw=' + encodeURIComponent(pw));
}

// 带 cookie 请求
function req(path, opts, cookie, cb) {
  const headers = Object.assign({}, opts.headers || {});
  if (cookie) headers.Cookie = cookie;
  const r = http.request(BASE + path, Object.assign({ method: 'GET' }, opts, { headers }), res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => cb(res.statusCode, body));
  });
  r.on('error', e => cb(0, e.message));
  if (opts.body) r.write(opts.body);
  r.end();
}

// ============ 主测试 ============
const fs = require('fs');
const auth = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.server-auth.json'), 'utf8'));

console.log('========== COOPER OS 正/负路径测试 ==========\n');

login(auth.password, cookie => {
  console.log('登录 cookie:', cookie ? '✅ 已获取' : '❌ 获取失败');

  /* ===== 正路径（正常操作） ===== */
  console.log('\n--- 正路径（正常操作）---');
  req('/api/load', {}, cookie, (code, body) => {
    check('GET /api/load 正常返回', code === 200, 'code=' + code);
    let data = {};
    try { data = JSON.parse(body); check('返回 JSON 合法', true); } catch { check('返回 JSON 合法', false); }

    // 正常保存数据
    req('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: '__sectest', value: { t: Date.now() } }) }, cookie, (code) => {
      check('POST /api/save 正常保存', code === 200, 'code=' + code);

      // 主页
      req('/', {}, cookie, (code, body) => {
        check('GET / 返回工作台', code === 200 && body.includes('galaxy-core'));

        /* ===== 负路径（恶意输入） ===== */
        console.log('\n--- 负路径（恶意输入）---');

        // 1. 恶意 JSON（非法格式）
        req('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid json!!' }, cookie, (code) => {
          check('非法 JSON 不崩溃（返回 4xx）', code === 400, 'code=' + code);

          // 2. 超长数据（10MB）
          const big = JSON.stringify({ key: '__bigtest', value: 'A'.repeat(10 * 1024 * 1024) });
          req('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: big }, cookie, (code) => {
            check('超长数据有响应（不挂死）', code > 0, 'code=' + code);

            // 3. 路径穿越（目录遍历）
            req('/api/launch/../../etc/passwd', {}, cookie, (code) => {
              check('路径穿越被拒（404/非崩溃）', code === 404 || code === 400, 'code=' + code);

              // 4. 未知 API
              req('/api/nonexistent', {}, cookie, (code) => {
                check('未知 API 返回 404', code === 404, 'code=' + code);

                // 5. 超长 URL
                req('/' + 'x'.repeat(5000), {}, cookie, (code) => {
                  check('超长 URL 不崩溃', code > 0, 'code=' + code);

                  // 6. 未认证访问（无 cookie）
                  req('/api/load', {}, '', (code) => {
                    check('未认证 API 被拦截', code === 401, 'code=' + code);

                    // 7. 注入尝试（XSS payload 存数据）
                    const xss = JSON.stringify({ key: '__xsstest', value: '<script>alert(1)</script>' });
                    req('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: xss }, cookie, (code) => {
                      check('XSS 载荷存储有响应', code === 200, 'code=' + code);

                      // 清理测试数据
                      req('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: '__sectest', value: null }) }, cookie, () => {
                        req('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: '__bigtest', value: null }) }, cookie, () => {
                          req('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: '__xsstest', value: null }) }, cookie, () => {
                            console.log('\n========== 测试结果: ' + pass + ' 通过 / ' + fail + ' 失败 ==========');
                            process.exit(fail > 0 ? 1 : 0);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
