// 查 applyServerData 轮询逻辑（可能覆盖本地数据）
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 找 applyServerData 函数
const idx = html.indexOf('function applyServerData');
console.log('=== applyServerData 函数 ===');
if (idx >= 0) console.log(html.slice(idx, idx + 1500));
else console.log('❌ 未找到');

// 找它的调用上下文（每5秒轮询）
const pollIdx = html.indexOf('setInterval(applyServerData, 5000)');
console.log('\n=== 轮询上下文 ===');
if (pollIdx >= 0) console.log(html.slice(pollIdx - 600, pollIdx + 200));
