// 删除重复的旧版 galaxy 容器（第二个：orbit + ring + 旧 core）
const fs = require('fs');
const path = 'C:/Users/wyb/Desktop/草哥工作台/index.html';
let html = fs.readFileSync(path, 'utf8');

// 找到第二个 galaxy 容器（旧的，含 orbit）
const g1 = html.indexOf('<div class="galaxy">');
const g2 = html.indexOf('<div class="galaxy">', g1 + 10);
console.log('galaxy 容器: @' + g1 + ' 和 @' + g2);

if (g1 < 0 || g2 < 0) { console.log('❌ 未找到两个容器'); process.exit(1); }

// 确认第二个是旧版（含 orbit）
const seg2 = html.slice(g2, g2 + 400);
console.log('第二个容器开头:', seg2.slice(0, 200).replace(/\n/g, ' '));

// 用配平找第二个容器的结束
let depth = 0, i = g2, g2End = -1;
while (i < html.length) {
  if (html.startsWith('<div', i)) depth++;
  if (html.startsWith('</div>', i)) {
    depth--;
    if (depth === 0) { g2End = i + 6; break; }
  }
  i++;
}
console.log('第二个容器结束: @' + g2End, '| 内容长度:', g2End - g2);

// 检查第二个容器里有没有 orbit/ring（确认是旧版）
const oldContent = html.slice(g2, g2End);
const hasOrbit = oldContent.includes('orbit');
const hasRing = oldContent.includes('core-ring');
console.log('第二个容器含 orbit:', hasOrbit, '| 含 core-ring:', hasRing);

if (hasOrbit || hasRing) {
  // 删除整个第二个容器
  html = html.slice(0, g2) + html.slice(g2End);
  console.log('✅ 已删除旧版 galaxy 容器');
} else {
  console.log('⚠️ 第二个容器不是旧版，不删除（先人工确认）');
  console.log(oldContent.slice(0, 500));
}

// 校验
let bal = 0;
for (const ch of html) { if (ch === '{') bal++; if (ch === '}') bal--; }
console.log('花括号:', bal === 0 ? '✅' : '❌ ' + bal);
let bal2 = 0;
for (const ch of html) { if (ch === '(') bal2++; if (ch === ')') bal2--; }
console.log('圆括号:', bal2 === 0 ? '✅' : '❌ ' + bal2);

// 确认现在只剩 1 个 galaxy
const galaxyCount = (html.match(/<div class="galaxy">/g) || []).length;
const coreCount = (html.match(/class="galaxy-core"/g) || []).length;
console.log('galaxy 容器:', galaxyCount, '| galaxy-core:', coreCount);

fs.writeFileSync(path, html);
console.log('\n✅ 清理完成！大小:', (html.length / 1024).toFixed(1), 'KB');
