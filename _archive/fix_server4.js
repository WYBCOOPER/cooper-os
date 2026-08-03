// 精确修复第 111 行 console.log
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/server.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// 找到含 COOPER OS 的 console.log 行
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('COOPER OS') && lines[i].includes('console.log')) {
    console.log('原始第', i + 1, '行:', lines[i]);
    // 替换整行为正确的中文欢迎语
    lines[i] = "  console.log('  COOPER OS 服务器已启动 ✓');";
    console.log('✅ 已替换为:', lines[i]);
  }
  // 其他 console.log 里的乱码（中文问候）
  if (lines[i].includes('console.log') && /[\uE000-\uF8FF]/.test(lines[i])) {
    lines[i] = lines[i].replace(/[\uE000-\uF8FF\uFFFD]/g, '?');
    console.log('⚠️ 第', i + 1, '行清理');
  }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('✅ 写入完成');
