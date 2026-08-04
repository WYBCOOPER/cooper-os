// 重新抓取 + 生成禁弹窗版 + 截图
const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');

// 1. 登录抓取
function loginAndFetch() {
  return new Promise((resolve, reject) => {
    const loginBody = 'pw=1905';
    const req = http.request({
      host: 'localhost', port: 3000, path: '/__login', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(loginBody) }
    }, res => {
      const cookie = (res.headers['set-cookie'] || []).join('; ');
      http.get({ host: 'localhost', port: 3000, path: '/', headers: { Cookie: cookie } }, r2 => {
        let d = '';
        r2.on('data', c => d += c);
        r2.on('end', () => { fs.writeFileSync('_dev-scripts/snow11_fixed_local.html', d); resolve(d.length); });
      });
    });
    req.on('error', reject);
    req.write(loginBody);
    req.end();
  });
}

// 2. 注入禁弹窗
function injectNoModal() {
  let s = fs.readFileSync('_dev-scripts/snow11_fixed_local.html', 'utf8');
  const inject = `
<script>
  window.__noModal = true;
  const _to = window.setTimeout;
  window.setTimeout = function(fn, ms) {
    if (String(fn).includes('showMorningBrief') || String(fn).includes('showWeeklyReview')) return 0;
    return _to(fn, ms);
  };
  setInterval(function() {
    var m = document.getElementById('modal-overlay');
    if (m && m.classList.contains('open')) m.classList.remove('open');
    if (m) m.style.display = 'none';
  }, 100);
</script>
</body>`;
  s = s.replace('</body>', inject);
  fs.writeFileSync('_dev-scripts/snow11_fixed_notest.html', s);
}

(async () => {
  const len = await loginAndFetch();
  console.log('✅ 抓取完成 ' + len + ' 字符');
  injectNoModal();
  console.log('✅ 禁弹窗版生成');
})();
