// 验证回滚后：喝水打卡逻辑是否完整可用
const fs = require('fs');
const html = fs.readFileSync('C:/Users/wyb/Desktop/草哥工作台/index.html', 'utf8');

// 1. 找 renderWater 函数（打卡渲染）
const rwIdx = html.indexOf('function renderWater');
console.log('=== renderWater 函数 ===');
if (rwIdx >= 0) {
  const end = html.indexOf('\n  }', rwIdx) + 4;
  console.log(html.slice(rwIdx, Math.min(rwIdx + 600, end + 100)));
} else {
  console.log('❌ renderWater 未找到');
}

// 2. 找打卡点击逻辑（water 相关 onclick）
console.log('\n=== 喝水打卡交互 ===');
const clicks = html.match(/water[A-Za-z]*\(|addWater|drinkWater/g) || [];
console.log('打卡函数:', clicks.join(', '));
