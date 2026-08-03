// 整行替换第 100 行（乱码 msg）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// 找到包含 /api/doc/ 处理的那行（乱码行）
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('JSON.stringify({ ok: true, msg:')) {
    lines[i] = "    res.end(JSON.stringify({ ok: true, msg: '文档中心：请将文件放入本目录 docs/ 文件夹' }));";
    console.log('✅ 已替换第', i + 1, '行');
    break;
  }
}

// 修复其他可能乱码的注释行
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('\uE000') || lines[i].includes('\uFFFD')) {
    // PUA 或替换字符
    const cleaned = lines[i].replace(/[\uE000-\uF8FF\uFFFD]/g, '?');
    lines[i] = cleaned;
    console.log('⚠️ 第', i + 1, '行有 PUA 字符，已清理');
  }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('✅ server.js 写入完成');
