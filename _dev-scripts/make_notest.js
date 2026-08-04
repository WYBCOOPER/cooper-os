// 生成禁弹窗测试版（文件方式，不内联）
const fs = require('fs');
let s = fs.readFileSync('snow11_integrated_local.html', 'utf8');

const inject = `
<script>
  // 测试专用：禁用自动弹窗
  window.__noModal = true;
  const _to = window.setTimeout;
  window.setTimeout = function(fn, ms) {
    if (String(fn).includes('showMorningBrief') || String(fn).includes('showWeeklyReview')) return 0;
    return _to(fn, ms);
  };
  // 启动后强制隐藏所有 modal
  setInterval(function() {
    var m = document.getElementById('modal-overlay');
    if (m && m.classList.contains('open')) m.classList.remove('open');
    if (m) m.style.display = 'none';
  }, 100);
</script>
</body>`;

if (s.includes('</body>')) {
  s = s.replace('</body>', inject);
  fs.writeFileSync('snow11_notest.html', s);
  console.log('✅ 禁弹窗测试版生成');
} else {
  console.log('❌ 未找到 </body>');
}
