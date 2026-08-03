// 全面自检：COOPER OS 新设计 + 服务器 + 搜索 + 已知问题
const fs = require('fs');
const { execSync } = require('child_process');

console.log('========== 1. COOPER OS 文件健康 ==========');
const htmlPath = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// HTML 括号平衡
let bal = 0, minB = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; if (bal < minB) minB = bal; }
console.log('HTML 花括号:', bal === 0 ? '✅ 平衡' : '❌ ' + bal);

// JS 语法粗检（提取 script 块）
const scripts = html.match(/<script>[\s\S]*?<\/script>/g) || [];
console.log('script 块数量:', scripts.length);
let jsOk = true;
for (let i = 0; i < scripts.length; i++) {
  const code = scripts[i].replace(/<\/?script>/g, '');
  try { new Function(code); } catch (e) { jsOk = false; console.log(`❌ script[${i}] 语法错误: ${e.message.slice(0, 100)}`); }
}
console.log('JS 语法:', jsOk ? '✅ 全部通过' : '❌ 有错误');

// CSS 括号
const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (cssMatch) {
  let cbal = 0; for (const ch of cssMatch[1]) { if (ch === '{') cbal++; if (ch === '}') cbal--; }
  console.log('CSS 括号:', cbal === 0 ? '✅ 平衡' : '❌ ' + cbal);
}

console.log('\n========== 2. 服务器状态 ==========');
try {
  const r = execSync('netstat -ano | findstr :3001 | findstr LISTENING', { encoding: 'utf8' }).trim();
  console.log('3001 端口:', r ? '✅ 运行中' : '❌ 未运行');
} catch { console.log('3001 端口: ❌ 未运行'); }

console.log('\n========== 3. 已知问题排查 ==========');
// server.js 乱码检查
const serverJs = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/server.js', 'utf8');
console.log('server.js 含乱码:', /[\uE000-\uF8FF\uFFFD]/.test(serverJs) ? '❌ 有' : '✅ 无');
console.log('server.js HTML_FILE 指向:', serverJs.includes("'index.html'") ? '✅ index.html' : '❌ 路径异常');
try { new Function(serverJs); console.log('server.js 语法: ✅'); } catch (e) { console.log('server.js 语法: ❌ ' + e.message.slice(0, 80)); }

// searxng 容器
console.log('\n========== 4. 联网搜索 ==========');
try {
  const sr = execSync('wsl -u root -e sh -c "docker ps --filter name=searxng --format {{.Status}}"', { encoding: 'utf8' }).trim();
  console.log('searxng 容器:', sr ? '✅ ' + sr : '❌ 未运行');
} catch { console.log('searxng 容器: ❌ 未运行'); }
