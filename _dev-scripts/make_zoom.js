// 裁剪截图中央区域放大检查
const fs = require('fs');
const path = require('path');
// 用 PowerShell 无库，改用 HTML 方式放大
const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { margin:0; background:#111; display:flex; justify-content:center; padding:20px; }
  img { width: 900px; }
</style></head><body>
  <img src="snow11_fixed2_shot.png">
</body></html>`;
fs.writeFileSync('zoom.html', html);
console.log('zoom.html 生成');
