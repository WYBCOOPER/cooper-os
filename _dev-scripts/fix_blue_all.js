// 综合修复：抽屉深蓝夜空背景 + 重新截图验证
const fs = require('fs');
const http = require('http');
const { execSync } = require('child_process');

const ROOT = 'C:/Users/wyb/Desktop/草哥工作台';
const DEV = ROOT + '/_dev-scripts';
const HTML = ROOT + '/index.html';

// ========== 1. 修复抽屉背景（精确替换 background 行）==========
let s = fs.readFileSync(HTML, 'utf8');

// 找到带 !important 的 .drawer 覆盖规则（最后一个 .drawer { ... } 块）
const drawerRe = /\.drawer\s*\{[^}]*background:[^}]*\}/g;
let m, lastDrawer;
while ((m = drawerRe.exec(s)) !== null) { lastDrawer = m; }

if (lastDrawer) {
  const oldBlock = lastDrawer[0];
  // 只替换 background 部分
  const newBg = `background:
      radial-gradient(ellipse at 50% 0%, rgba(70,105,170,0.30), transparent 60%),
      radial-gradient(ellipse at 20% 85%, rgba(232,201,143,0.10), transparent 40%),
      radial-gradient(ellipse at 85% 70%, rgba(232,201,143,0.07), transparent 35%),
      linear-gradient(to bottom, rgba(20,32,62,0.94), rgba(12,18,38,0.97)) !important;`;
  const newBlock = oldBlock.replace(/background:[\s\S]*?!important;/, newBg);
  s = s.split(oldBlock).join(newBlock);
  console.log('✅ 抽屉背景已替换为深蓝夜空+星光');

  // 卡片也调蓝
  const cardRe = /\.drawer \.card\s*\{[^}]*background:[^}]*\}/;
  const cm = cardRe.exec(s);
  if (cm) {
    const nb = cm[0].replace(/background:[\s\S]*?;/, 'background: rgba(24,38,72,0.65) !important;');
    s = s.split(cm[0]).join(nb);
    console.log('✅ 卡片背景已调蓝');
  }
} else {
  console.log('❌ 未找到 .drawer 覆盖规则');
}

fs.writeFileSync(HTML, s);
fs.copyFileSync(HTML, ROOT + '/草哥工作台.html');
console.log('✅ index.html + 网页版已保存');

// ========== 2. 重新抓取登录后页面 ==========
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
        r2.on('end', () => { fs.writeFileSync(DEV + '/snow11_fixed_local.html', d); resolve(d.length); });
      });
    });
    req.on('error', reject);
    req.write(loginBody);
    req.end();
  });
}

// ========== 3. 生成 禁弹窗 + 自动打开抽屉 版 ==========
function makeTestFile() {
  let t = fs.readFileSync(DEV + '/snow11_fixed_local.html', 'utf8');
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
  window.addEventListener('load', function() {
    setTimeout(function() {
      var d1btn = document.querySelector('.dial[data-drawer="d1"]');
      if (d1btn) d1btn.click();
      setTimeout(function() { window.scrollTo(0, 480); }, 600);
    }, 1500);
  });
</script>
</body>`;
  t = t.replace('</body>', inject);
  fs.writeFileSync(DEV + '/snow11_blue_drawer.html', t);
  console.log('✅ 测试版生成');
}

(async () => {
  const len = await loginAndFetch();
  console.log('✅ 抓取完成 ' + len + ' 字符');
  makeTestFile();
  console.log('✅ 全部就绪');
})();
