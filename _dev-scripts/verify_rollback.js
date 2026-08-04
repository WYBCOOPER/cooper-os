// 回滚后全面验证：JS 语法 + 功能完整性
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. modal 关闭函数
console.log('=== 弹窗关闭函数 ===');
console.log('closeModal:', html.includes('function closeModal') ? '✅' : '❌');
console.log('modalOk:', html.includes('function modalOk') ? '✅' : '❌');
console.log('openModal:', html.includes('function openModal') ? '✅' : '❌');

// 2. modal-overlay 默认隐藏 + 点击外部关闭
console.log('\n=== modal 关闭逻辑 ===');
const closeIdx = html.indexOf("addEventListener('click'");
if (closeIdx >= 0) {
  console.log('有 overlay 点击关闭逻辑 ✅');
}

// 3. 喝水打卡
console.log('\n=== 喝水 ===');
console.log('renderWater:', html.includes('function renderWater') ? '✅' : '❌');
console.log('toggleWater:', html.includes('function toggleWater') ? '✅' : '❌');
console.log('water-grid:', html.includes('id="water-grid"') ? '✅' : '❌');

// 4. 板块
console.log('\n=== 板块 ===');
['d1','d2','d3','d4','d5','d6','d7'].forEach(d => {
  if (!html.includes('id="' + d + '"')) console.log('❌ 缺', d);
});
console.log('d1-d7 检查完成');

// 5. 提取 JS 验证语法
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allJs = '';
scripts.forEach(s => allJs += s.replace(/^<script>/, '').replace(/<\/script>$/, '') + '\n');
fs.writeFileSync('C:/Users/wyb/Desktop/草哥工作台/_rollback_check.js', allJs);
console.log('\nJS 已提取:', allJs.length, '字符（语法由 node --check 验证）');
