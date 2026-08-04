// 模拟点击打开抽屉（学业 d1）后截图
const fs = require('fs');
let s = fs.readFileSync('snow11_fixed_notest.html', 'utf8');

// 注入：页面加载后自动打开学业抽屉 + 滚动到抽屉
const inject = `
<script>
  window.addEventListener('load', function() {
    setTimeout(function() {
      // 模拟点击学业板块按钮
      var d1btn = document.querySelector('.dial[data-drawer="d1"]');
      if (d1btn) d1btn.click();
      // 滚动到抽屉位置
      setTimeout(function() {
        var dr = document.getElementById('d1');
        if (dr) dr.scrollIntoView({ block: 'start' });
        window.scrollTo(0, 500);
      }, 600);
    }, 1500);
  });
</script>
</body>`;

if (s.includes('</body>')) {
  s = s.replace('</body>', inject);
  fs.writeFileSync('snow11_drawer_open.html', s);
  console.log('✅ 自动打开抽屉版生成');
} else {
  console.log('❌ 未找到 </body>');
}
