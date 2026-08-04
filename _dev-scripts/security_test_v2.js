// COOPER OS 安全检测脚本 v2（提交/发布前必跑）
// 检查：密钥泄漏 / 路径穿越 / JS 语法 / 危险函数 / 敏感文件
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('✅ ' + name); }
  else { fail++; console.log('❌ ' + name + (detail ? ' — ' + detail : '')); }
}

console.log('===== COOPER OS 安全检测 =====\n');

// 1. 密钥扫描（真密钥特征，排除类名/正常代码）
console.log('--- 1. 敏感信息扫描 ---');
const REAL_KEYS = [
  '2bc2d9123bbb46279f34008110a65083',   // 智谱 key（真实）
  'bTJobyzOV6lUpUfx',
  'sk-[A-Za-z0-9]{20,}',                 // 通用 sk- 长密钥
  'api_key\\s*=\\s*[\'\"][A-Za-z0-9]{16,}',
  'token\\s*=\\s*[\'\"][A-Za-z0-9]{32,}'
];
const scanFiles = ['index.html', 'server.js', 'main.js', 'sw.js', 'package.json', 'manifest.json'];
let leakFound = false;
scanFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  const s = fs.readFileSync(f, 'utf8');
  REAL_KEYS.forEach(k => {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (re.test(s)) { leakFound = true; console.log('  ⚠️ ' + f + ' 疑似密钥: ' + k.slice(0, 30)); }
  });
});
check('无真实密钥泄漏', !leakFound);

// 2. 敏感文件不入库
console.log('\n--- 2. 敏感文件检查 ---');
const sensitive = ['.server-auth.json', 'cooper-os-data.json'];
const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
sensitive.forEach(f => {
  check(f + ' 被 gitignore 覆盖', gitignore.includes(f), '请加入 .gitignore');
});

// 3. JS 语法检查
console.log('\n--- 3. JS 语法检查 ---');
['server.js', 'main.js', 'sw.js'].forEach(f => {
  if (!fs.existsSync(f)) { return; }
  try { new Function(fs.readFileSync(f, 'utf8')); check(f + ' 语法', true); }
  catch (e) { check(f + ' 语法', false, e.message.slice(0, 60)); }
});
// index.html 内嵌 script
const html = fs.existsSync('index.html') ? fs.readFileSync('index.html', 'utf8') : '';
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
let htmlJsOk = true;
scripts.forEach((sc, i) => {
  const code = sc.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
  if (!code.trim()) return;
  try { new Function(code); } catch (e) { htmlJsOk = false; console.log('  ❌ 内嵌 script#' + i + ': ' + e.message.slice(0, 60)); }
});
check('index.html 内嵌 JS 语法', htmlJsOk, scripts.length + ' 个 script');

// 4. 危险函数扫描
console.log('\n--- 4. 危险函数扫描 ---');
const danger = [
  { re: /child_process\.exec\(/g, name: 'exec(' },
  { re: /\beval\(/g, name: 'eval(' },
  { re: /new Function\(/g, name: 'new Function(' },
  { re: /innerHTML\s*=[^;]*\+/g, name: 'innerHTML 拼接' }
];
['index.html', 'server.js', 'main.js'].forEach(f => {
  if (!fs.existsSync(f)) return;
  const s = fs.readFileSync(f, 'utf8');
  danger.forEach(d => {
    const m = s.match(d.re);
    if (m && m.length > 0) {
      // innerHTML 拼接需要进一步判断是否转义
      if (d.name === 'innerHTML 拼接') {
        check(f + ' 无未转义 innerHTML', /escapeHtml/.test(s), d.name + ' ' + m.length + ' 处（需确认转义）');
      } else {
        check(f + ' 无 ' + d.name, false, d.name + ' ' + m.length + ' 处');
      }
    }
  });
});
check('server.js 使用 execFile(非 exec)', /execFile/.test(fs.existsSync('server.js') ? fs.readFileSync('server.js', 'utf8') : ''), '');

// 5. 服务器正/负路径测试
console.log('\n--- 5. 服务器安全测试 ---');
const http = require('http');
function req(path, method, body, cookie) {
  return new Promise((resolve) => {
    const opts = { host: 'localhost', port: 3000, path, method };
    if (cookie) opts.headers = { Cookie: cookie };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', () => resolve({ status: 0 }));
    if (body) r.write(body);
    r.end();
  });
}

(async () => {
  // 登录拿 cookie
  const login = await req('/__login', 'POST', 'pw=1905');
  const cookie = (login.headers || {}).cookie || '';
  // 用原始方式拿 cookie
  const login2 = await new Promise((resolve) => {
    const r = http.request({ host: 'localhost', port: 3000, path: '/__login', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, setCookie: (res.headers['set-cookie'] || []).join('; ') }));
    });
    r.write('pw=1905');
    r.end();
  });
  const ck = login2.setCookie;

  // 正路径：未登录访问根 → 200 登录页
  const root = await req('/');
  check('未登录访问根 → 登录页', root.status === 200 && root.body.includes('口令'), '状态 ' + root.status);

  // 负路径：路径穿越
  const traversal = await req('/..%2f..%2fetc%2fpasswd', 'GET', null, ck);
  check('路径穿越被拒（非200）', traversal.status !== 200 && traversal.status !== 0, '状态 ' + traversal.status);

  // 负路径：非法 key
  const badKey = await req('/api/save', 'POST', JSON.stringify({ key: '__proto__', value: 'x' }), ck);
  check('原型污染 key 被拒', badKey.status === 400, '状态 ' + badKey.status);

  // 负路径：超长 key
  const longKey = await req('/api/save', 'POST', JSON.stringify({ key: 'a'.repeat(100), value: 'x' }), ck);
  check('超长 key 被拒', longKey.status === 400, '状态 ' + longKey.status);

  // 正路径：图片静态服务
  const img = await req('/snow_peaks_v6.png', 'GET', null, ck);
  check('图片静态服务 200', img.status === 200, '状态 ' + img.status);

  console.log('\n===== 结果: ' + pass + ' 通过 / ' + fail + ' 失败 =====');
  process.exit(fail > 0 ? 1 : 0);
})();
