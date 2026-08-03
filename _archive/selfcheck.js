// 全面自检：COOPER OS 改造是否生效
const fs = require('fs');

// 1. 检查开发版 index.html
const devPath = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const devHtml = fs.readFileSync(devPath, 'utf8');
console.log('=== 1. 开发版 index.html ===');
console.log('大小:', (devHtml.length / 1024).toFixed(1), 'KB');
console.log('含金色 accent:', devHtml.includes('#d4af6a') ? '✅ 是' : '❌ 否');
console.log('含星云背景:', devHtml.includes('body::before') ? '✅ 是' : '❌ 否');
console.log('含手机增强:', devHtml.includes('手机增强：深空星云') ? '✅ 是' : '❌ 否');

// 2. 检查网页版副本
const webPath = 'C:/Users/wyb/Desktop/草哥工作台.html';
if (fs.existsSync(webPath)) {
  const webHtml = fs.readFileSync(webPath, 'utf8');
  console.log('\n=== 2. 网页版副本 草哥工作台.html ===');
  console.log('大小:', (webHtml.length / 1024).toFixed(1), 'KB');
  console.log('含金色 accent:', webHtml.includes('#d4af6a') ? '✅ 已同步' : '❌ 未同步（旧版）');
} else {
  console.log('\n=== 2. 网页版副本 ===');
  console.log('❌ 文件不存在');
}

// 3. 检查备份
const bakPath = 'C:/Users/wyb/Desktop/草哥工作台/index_v1026_backup.html';
if (fs.existsSync(bakPath)) {
  const bakHtml = fs.readFileSync(bakPath, 'utf8');
  console.log('\n=== 3. 备份 ===');
  console.log('大小:', (bakHtml.length / 1024).toFixed(1), 'KB');
  console.log('含旧蓝色 accent #4f8dff:', bakHtml.includes('#4f8dff') ? '✅ 是（旧版备份正常）' : '❌ 否');
}
