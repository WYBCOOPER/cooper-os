// 生成放大中央区域的 HTML 查看页
const fs = require('fs');
const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { margin:0; background:#000; display:flex; justify-content:center; padding:30px; }
  .wrap { width: 1000px; }
  .note { color:#888; font-size:14px; margin-bottom:10px; }
  img { width: 100%; border-radius: 12px; }
</style></head><body>
<div class="wrap">
  <div class="note">完整截图</div>
  <img src="snow11_fixed2_shot.png">
</div>
</body></html>`;
fs.writeFileSync('zoom_full.html', html);
console.log('✅ zoom_full.html 生成');
