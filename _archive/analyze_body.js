// 分析 body 骨架结构（HTML 部分）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
const html = fs.readFileSync(path, 'utf8');

// 提取 body 内容
const bodyMatch = html.match(/<body[\s\S]*<\/body>/);
if (!bodyMatch) { console.log('❌ body 未找到'); process.exit(1); }
const body = bodyMatch[0];
console.log('body 长度:', body.length);

// 找所有 section / 抽屉标题（卡片标题 emoji + 文字）
console.log('\n=== 抽屉和卡片标题 ===');
const titles = body.match(/<div class="card-head">[^<]*<\/div>/g) || [];
titles.forEach(t => console.log('卡:', t.replace(/<[^>]+>/g, '').trim()));

console.log('\n=== 抽屉标题 ===');
const drawerTitles = body.match(/<div class="drawer[^"]*"[^>]*>[\s\S]*?<div class="card-head">[^<]*/g) || [];
drawerTitles.forEach(t => console.log('抽屉:', t.slice(-30).replace(/<[^>]+>/g, '').trim()));

// 看 command-deck 完整结构
console.log('\n=== command-deck 结构 ===');
const deck = body.match(/<div class="command-deck">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
if (deck) console.log(deck[0].slice(0, 1500));
