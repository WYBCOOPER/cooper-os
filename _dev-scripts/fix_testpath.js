// 修复 security_test.js 路径问题
const fs = require('fs');
const p = 'C:/Users/wyb/Desktop/草哥工作台/_dev-scripts/security_test.js';
let s = fs.readFileSync(p, 'utf8');

// .server-auth.json 在项目根目录，不在 _dev-scripts
const old = `const auth = JSON.parse(fs.readFileSync(__dirname + '/.server-auth.json', 'utf8'));`;
const newP = `const auth = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.server-auth.json'), 'utf8'));`;

// 检查是否已引入 path
if (s.includes(old)) {
  s = s.replace(old, newP);
  if (!s.includes("const path = require('path')")) {
    s = s.replace("const http = require('http');", "const http = require('http');\nconst path = require('path');");
  }
  fs.writeFileSync(p, s);
  console.log('✅ security_test.js 路径已修复');
} else {
  console.log('⚠️ 未匹配（可能已修复）');
}
