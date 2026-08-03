// 排查：核心形状 + 聚焦添加 + DDL 显示
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

console.log('=== 1. 核心 CSS（为什么像鸡蛋）===');
const coreIdx = html.indexOf('.galaxy-core {');
console.log(html.slice(coreIdx, coreIdx + 900));

console.log('\n=== 2. 添加聚焦按钮在哪 ===');
const addIdx = html.indexOf('deck-add');
if (addIdx >= 0) {
  console.log('deck-add 上下文:');
  console.log(html.slice(addIdx - 200, addIdx + 200));
}

console.log('\n=== 3. addFocus 函数 ===');
const afIdx = html.indexOf('function addFocus');
if (afIdx >= 0) console.log(html.slice(afIdx, afIdx + 400));

console.log('\n=== 4. DDL 渲染函数 ===');
const ddlIdx = html.indexOf('deck-ddl');
if (ddlIdx >= 0) {
  // 找 renderDDL 或类似函数
  const fnIdx = html.indexOf('deck-ddl\'); box.innerHTML');
  if (fnIdx > 0) {
    // 向前找 function
    const fnStart = html.lastIndexOf('function ', fnIdx);
    console.log(html.slice(fnStart, fnStart + 300));
  }
}
