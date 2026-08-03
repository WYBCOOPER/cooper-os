// 修复测试脚本端口 3001 → 3000
const fs = require('fs');
const p = 'C:/Users/wyb/Desktop/草哥工作台/_dev-scripts/security_test.js';
let s = fs.readFileSync(p, 'utf8');

// 看当前 BASE 定义
const m = s.match(/const BASE = [^\n]+/);
console.log('当前 BASE:', m ? m[0] : '未找到');

// 替换端口
s = s.replace(/localhost:3001/g, 'localhost:3000');
fs.writeFileSync(p, s);
console.log('✅ 已替换所有 3001 → 3000');

const m2 = s.match(/const BASE = [^\n]+/);
console.log('新 BASE:', m2 ? m2[0] : '未找到');
